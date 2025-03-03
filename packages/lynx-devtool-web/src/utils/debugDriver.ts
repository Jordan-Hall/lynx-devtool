// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { KEY_USE_VPN_IP } from '@/store/server';
import { IDevice } from '@/types/device';
import {
  ECustomDataType,
  ERemoteDebugDriverEventNames,
  ERemoteDebugDriverExternalEvent,
  IClientDescriptor,
  IRemoteDebugDriverEvent2Payload,
  IRemoteDebugServer4Driver,
  ISocketMessage,
  SocketEvents,
  bootstrapRemoteDriver,
  getRemoteDebugDriver
} from '@lynx-dev/lynx-devtool-web-components';
import { getCurrentIntranetIp } from '.';
import LDT_CONST, { isOfflineMode } from './const';
import { queryService } from './query';
import { getSelectClientId } from './storeUtils';
import envLogger from './envLogger';

export interface ICustomMessage {
  type?: string;
  params: Record<string, any>;
  clientId?: number;
  sessionId?: number;
  useParamsAsData?: boolean;
}

class DebugDriver {
  private _messageIndex = 10000;
  private _timeout: NodeJS.Timeout | null = null;
  private _listenerMap = new Map<ERemoteDebugDriverEventNames, any[]>();

  async connect(url: string, roomId: string): Promise<IRemoteDebugServer4Driver> {
    const wsInQuery = queryService.getWSUrlInQuery();
    if (wsInQuery) {
      const { host } = location;
      if (host.startsWith('localhost')) {
        const arr = url.substring(5, url.indexOf('/mdevices/page/android')).split(':');
        if (arr.length === 2) {
          url = `ws://127.0.0.1:${arr[1]}/mdevices/page/android`;
        }
      }
    }
    const driver = await bootstrapRemoteDriver(url, roomId);
    // After the driver reconnects, it needs to re-register the listener.
    this._listenerMap.forEach((value, key) => {
      value.forEach((listener) => {
        driver.off(key, listener);
        driver.on(key, listener);
      });
    });
    return driver;
  }

  async getRemoteSchema(prefix?: string) {
    const driver = await getRemoteDebugDriver();
    let url = driver.getRemoteDebugAppSchema(prefix, false);
    const ws = queryService.getWSUrlInQuery();
    if (ws) {
      const arr = ws.substring(5, url.indexOf('/mdevices/page/android')).split(':');
      if (arr.length === 2) {
        const useVpn = localStorage.getItem(KEY_USE_VPN_IP) === 'true';
        if (useVpn && isOfflineMode()) {
          const innerIp = await getCurrentIntranetIp(!useVpn);
          url = url.replace('127.0.0.1', innerIp);
        } else {
          url = url.replace('127.0.0.1', arr[0]);
        }
      }
    }
    return url;
  }

  async sendCustomMessage(data: ICustomMessage) {
    if (!data.clientId) {
      data.clientId = getSelectClientId();
    }
    const customData: any = {
      type: data.type ?? 'CDP',
      data: {
        client_id: data.clientId,
        session_id: data.sessionId ?? -1
      }
    };
    if (data.useParamsAsData) {
      Object.assign(customData.data, data.params);
      // Support sending App type messages.
      if (data.params?.id && customData.data.message) {
        customData.data.message.id = data.params.id;
      }
    } else {
      customData.data.message = JSON.stringify(data.params);
    }
    const driver = await getRemoteDebugDriver();
    driver.sendCustomMessage(customData);
    envLogger.info(customData, {
      module: 'LDT',
      tag: 'sendMsg'
    });
  }

  sendMessageToApp(method: string, params: any) {
    return this.sendCustomMessageAsync({
      type: 'App',
      params: {
        message: {
          method,
          params
        }
      },
      useParamsAsData: true
    });
  }

  sendCustomMessageAsync(data: ICustomMessage, timeout = 5000): Promise<any> {
    const { params, type } = data;
    const clientId = data.clientId && data.clientId !== -1 ? data.clientId : getSelectClientId();
    params.id = this._messageIndex++;
    return new Promise((resolve, reject) => {
      let timer: any = null;
      const listener = (event: ISocketMessage<any>) => {
        if (
          event.event === SocketEvents.Customized &&
          (event.data?.type === (type ?? 'CDP') ||
            (event.data?.type === ECustomDataType.R2DStopAtEntry && type === ECustomDataType.D2RStopAtEntry) ||
            (event.data?.type === ECustomDataType.R2DStopLepusAtEntry &&
              type === ECustomDataType.D2RStopLepusAtEntry)) &&
          (event.data?.data?.client_id === clientId || event.data?.sender === clientId)
        ) {
          let message = event.data?.data?.message;
          if (message === undefined) {
            message = event.data?.data;
          } else if (typeof message === 'string') {
            message = JSON.parse(message);
          }
          let isCallback = false;
          if (
            type === LDT_CONST.MSG_GetGlobalSwitch ||
            type === LDT_CONST.MSG_SetGlobalSwitch ||
            type === ECustomDataType.D2RStopLepusAtEntry ||
            type === ECustomDataType.D2RStopAtEntry
          ) {
            isCallback = true;
          } else if (type === 'xdb_jsb' && message.type === 'invoke_resp') {
            isCallback = true;
          } else {
            isCallback = message?.id === params?.id;
          }

          if (isCallback) {
            this.off(ERemoteDebugDriverExternalEvent.All, listener);
            timer && clearTimeout(timer);
            if (type === 'App') {
              const result = JSON.parse(message.result || '{}');
              if (result.code < 0) {
                reject(new Error(`${message.method} ${result.message}`));
              } else {
                resolve(result);
              }
            } else {
              resolve(message);
            }
          }
        }
      };
      timer = setTimeout(() => {
        this.off(ERemoteDebugDriverExternalEvent.All, listener);
        reject(new Error(`send ${type} message timeout`));
      }, timeout);
      this.on(ERemoteDebugDriverExternalEvent.All, listener);
      this.sendCustomMessage(data);
    });
  }

  async on<T extends ERemoteDebugDriverEventNames>(
    name: T,
    callback: (payload: IRemoteDebugDriverEvent2Payload[T]) => void
  ) {
    try {
      const driver = await getRemoteDebugDriver();
      driver.on(name, callback);
      if (this._listenerMap.has(name)) {
        this._listenerMap.get(name)?.push(callback);
      } else {
        this._listenerMap.set(name, [callback]);
      }
    } catch (error) {}
  }

  async off<T extends ERemoteDebugDriverEventNames>(
    name: T,
    callback: (payload: IRemoteDebugDriverEvent2Payload[T]) => void
  ) {
    const driver = await getRemoteDebugDriver();
    driver.off(name, callback);
    const listeners = this._listenerMap.get(name);
    listeners?.splice(listeners.indexOf(callback), 1);
  }

  async getDeviceStatus(device: IDevice, enable: boolean) {
    const driver = await getRemoteDebugDriver();
    return new Promise<void>((resolve, reject) => {
      const { info } = device;
      const onClientList = (clients: IClientDescriptor[]) => {
        // If the appid, did are consistent, or the debugRouterId is consistent, it is considered to be the same device.
        const changeDevice = clients.find(
          (client) =>
            client.info &&
            ((client.info.appId === info.appId && client.info.did === info.did) ||
              (client.info.debugRouterId && client.info.debugRouterId === info.debugRouterId))
        );
        if ((changeDevice && enable) || (!enable && !changeDevice)) {
          driver.off(ERemoteDebugDriverExternalEvent.ClientList, onClientList);
          this._timeout && clearTimeout(this._timeout);
          resolve();
        }
      };
      driver.on(ERemoteDebugDriverExternalEvent.ClientList, onClientList);
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeout = setTimeout(() => {
        driver.off(ERemoteDebugDriverExternalEvent.ClientList, onClientList);
        reject(new Error(`Device ${enable? 'Connect': 'Disconnect'} timed out, please check the network.`));
      }, 15000);
    });
  }

  listSessions(clientId: number) {
    return this.sendCustomMessage({
      type: 'ListSession',
      params: {
        client_id: clientId
      },
      useParamsAsData: true
    });
  }

  isMainProcess(device: IDevice) {
    return device.info?.AppProcessName?.includes(':') !== true;
  }
}

const debugDriver = new DebugDriver();
export default debugDriver;
