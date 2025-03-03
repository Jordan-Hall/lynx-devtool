// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { canUseDebugRouter } from '@/services/device';
import useConnection from '@/store/connection';
import { IDevice, IGroupDevice } from '@/types/device';
import { ERemoteDebugDriverExternalEvent, ISocketMessage, SocketEvents } from '@lynx-dev/lynx-devtool-web-components';
import { t } from 'i18next';
import SocketIO from 'socket.io-client';
import debugDriver from './debugDriver';
import { getStore } from './flooks';
import { getSelectClient, getUser } from './storeUtils';

const KEY_CONNECT = 'connect';
const KEY_DISCONNECT = 'disconnect';
const KEY_JOINED = 'xdb_joined';
const KEY_JOIN_ROOM = 'xdb_device_joined';
const KEY_LEAVE_ROOM = 'xdb_device_disconnected';
const KEY_DEVICE_STATUS = 'xdb_device_status';
const KEY_MESSAGE = 'xdb_msg';

export interface IMessage {
  __id?: number;
  did?: string;
  roomId?: string;
  appId?: string;
  type: string;
  data?: any;
  isAsync?: boolean;
}

export interface IEvent {
  __id?: number;
  did: string;
  roomId: string;
  appId: string;
  type: string;
  data: any;
  info?: ILDTDeviceInfo;
}

interface ICacheMessage {
  message: IMessage;
  resolve?: (data: any) => void;
  reject?: (e: Error) => void;
}

interface ILDTDeviceInfo {
  version: string;
  platform: string;
  debugRouterVersion?: string;
  debugRouterId?: string;
}

export type OnMessageListener<T> = (data: T) => void;

const MAX_CACHE_DEVICE_COUNT = 15;
class XdbDriver {
  onClientList: OnMessageListener<Map<string, IDevice>> | undefined;
  bindDevices: IDevice[];

  private _roomMap = new Map<string, IDevice>();
  private _cacheMessages: Array<ICacheMessage> = [];
  private _index = 0;
  private _onClientListTimer: any;

  constructor() {
    this.bindDevices = JSON.parse(localStorage.getItem('bind_devices') || '[]');
  }

  sendMessage(message: IMessage, msgTimeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      message.__id = this._index++;
      if (!message.appId || !message.did) {
        const { selectedDevice } = getStore(useConnection);
        const { info, clientId } = selectedDevice;
        if (info || clientId) {
          message.appId = info.appId;
          message.did = info.did;
          if ((!message.appId || !message.did) && !clientId) {
            reject(new Error(t('ldt_not_open_notice') ?? ''));
            return;
          }
        } else {
          reject(new Error(t('ldt_not_open_notice') ?? ''));
          return;
        }
      }
      message.roomId = this.getRoomId(message.appId, message.did);
      // When sending a message, first determine whether someone has joined the room, If not, cache the message first, and send it all at once after joining.
      const isRoomJoined = this._roomMap.has(this.getRoomId(message.appId, message.did));
      if (isRoomJoined || this.canUseDebugDriver(message.appId, message.did)) {
        this._handleMessage(message, resolve, reject, msgTimeout);
      } else {
        this._cacheMessages.push({ message, resolve, reject });
      }
    });
  }

  sendMessageToDevice(device: IDevice, type: string, data: any, isAsync = false) {
    return this.sendMessage({
      appId: device.info?.appId,
      did: device.info?.did,
      type,
      data,
      isAsync
    });
  }

  sendMessageToCurrentDevice(type: string, data: any, isAsync = false) {
    const { selectedDevice: device } = getStore(useConnection);
    return this.sendMessageToDevice(device, type, data, isAsync);
  }

  getRoomId(appId?: string, did?: string) {
    return `${appId}:${did}`;
  }

  getDeviceRoomId(device: IDevice) {
    return `${device.info?.appId}:${device.info?.did}`;
  }

  getCurrentRoomId(): string {
    const { selectedDevice } = getStore(useConnection);
    if (selectedDevice) {
      const { info } = selectedDevice;
      if (info) {
        return this.getRoomId(info.appId, info.did);
      }
    }
    return '';
  }

  bindDevice(device: IDevice, sync = true) {
    const { info } = device;
    // Non-main process and simulator devices are not saved.
    if (info.appId && info.did && debugDriver.isMainProcess(device) && info.deviceType !== 'simulator') {
      const bindDevice = this.bindDevices.find((d) => info.appId === d.info.appId && info.did === d.info.did);
      if (!bindDevice) {
        this.bindDevices.push(device);
        this._saveToLocal();
        if (sync) {
          this.syncDevice(device);
        }
        return true;
      }
    }
    return false;
  }

  unbindDevice(device: IDevice) {
    const { info } = device;
    if (info.appId && info.did) {
      const index = this.bindDevices.findIndex((d) => info.appId === d.info.appId && info.did === d.info.did);
      if (index >= 0) {
        this._handleDeviceStatusChange(info.appId, info.did, false);
        this.bindDevices.splice(index, 1);
        this._saveToLocal();
        return true;
      }
    }
    return false;
  }

  updateDevice(device: IDevice) {
    const { info } = device;
    if (info.appId && info.did) {
      const bindDevice = this.bindDevices.find((d) => info.appId === d.info.appId && info.did === d.info.did);
      if (bindDevice) {
        Object.assign(bindDevice.info, info);
        this._saveToLocal();
        return true;
      }
    }
    return false;
  }

  // When the xdb device changes, you need to synchronize the deviceList.
  syncDevice(device: IDevice) {
    const { deviceList } = getStore(useConnection);
    if (!deviceList.find((d) => this.isSameDevice(device, d))) {
      deviceList.push(device);
    }
  }

  isRealOnline(device: IDevice) {
    return device.clientId || device.xdbOnline;
  }

  isDebugDriverOnline(appId?: string, did?: string) {
    if (appId && did) {
      return this.bindDevices.find((device) => device.info.appId === appId && device.info.did === did)?.clientId;
    }
    return false;
  }

  getDevice(appId?: string, did?: string) {
    if (appId && did) {
      return this.bindDevices.find((device) => device.info.appId === appId && device.info.did === did);
    }
  }

  canUseDebugDriver(appId?: string, did?: string) {
    const device = this.getDevice(appId, did) || getSelectClient();
    if (device) {
      return device.clientId && canUseDebugRouter(device);
    }
    return false;
  }

  // If the appId and did are the same, or the clientId is the same, or the debugRouterId is the same, it can be regarded as the same device.
  isSameDevice(first: IDevice, second: IDevice) {
    let isSame: any = first.clientId && first.clientId === second.clientId;
    if (!isSame) {
      if (first.info && second.info && debugDriver.isMainProcess(first) && debugDriver.isMainProcess(second)) {
        isSame =
          first.info.appId &&
          first.info.did &&
          first.info.appId === second.info.appId &&
          first.info.did === second.info.did;
        if (!isSame) {
          isSame = first.info.debugRouterId && first.info.debugRouterId === second.info.debugRouterId;
        }
      }
    }
    return Boolean(isSame);
  }

  isCurrentDevice(device: IDevice) {
    const { selectedDevice } = getStore(useConnection);
    return this.isSameDevice(device, selectedDevice);
  }

  getCurrentDevice(): IDevice {
    const { selectedDevice } = getStore(useConnection);
    return selectedDevice;
  }

  groupDevices(deviceList: IDevice[], groupKey: 'App' | 'deviceModel' = 'App'): IGroupDevice[] {
    const sortList = deviceList.sort((d0, d1) => d0.info[groupKey]?.localeCompare(d1.info[groupKey] ?? '') ?? 0);
    return sortList.map((device, index) => {
      let top = false;
      if (index === 0) {
        top = true;
      } else {
        const preDevice = sortList[index - 1];
        if (preDevice.info[groupKey] !== device.info[groupKey]) {
          top = true;
        }
      }
      return {
        ...device,
        top
      };
    });
  }

  private _handleDeviceStatusChange(
    appId: string,
    did: string,
    status: boolean,
    batch?: boolean,
    info?: ILDTDeviceInfo
  ) {
    if (status) {
      this._roomMap.set(this.getRoomId(appId, did), {
        xdbOnline: true,
        info: {
          ldtVersion: info?.version,
          // osType: info?.platform,
          debugRouterVersion: info?.debugRouterVersion,
          debugRouterId: info?.debugRouterId,
          appId,
          did
        } as any
      });
    } else {
      this._roomMap.delete(this.getRoomId(appId, did));
    }
    if (batch) {
      if (this._onClientListTimer) {
        clearTimeout(this._onClientListTimer);
      }
      this._onClientListTimer = setTimeout(() => {
        this.onClientList?.(this._roomMap);
        this._onClientListTimer = undefined;
      }, 500);
    } else {
      this.onClientList?.(this._roomMap);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private _handleMessage(message: IMessage, resolve: Function, reject: Function, msgTimeout = 10000) {
    if (this.canUseDebugDriver(message.appId, message.did)) {
      debugDriver.sendCustomMessage({ type: KEY_MESSAGE, params: message });
    }
  }

  private _saveToLocal() {
    // Only save info information.
    const localDevices = this.bindDevices
      .sort((a, b) => {
        if (this.isRealOnline(a)) {
          return 1;
        }
        if (this.isRealOnline(b)) {
          return -1;
        }
        return 0;
      })
      .slice(-MAX_CACHE_DEVICE_COUNT)
      .map((d) => {
        return {
          xdbId: d.xdbId,
          info: {
            appId: d.info.appId,
            did: d.info.did,
            deviceModel: d.info.deviceModel,
            osType: d.info.osType,
            App: d.info.App
          }
        };
      });
    localStorage.setItem('bind_devices', JSON.stringify(localDevices));
  }
}

const xdbDriver = new XdbDriver();
export default xdbDriver;
