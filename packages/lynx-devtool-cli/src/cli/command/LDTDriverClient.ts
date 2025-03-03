// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { DebugRouterConnector, SocketEvent } from '@lynx-dev/debug-router-connector';
import FakeMobileSocket, { ClientType } from '../utils/usbClient/fakeMobileSocket';
import { ERemoteDebugDriverExternalEvent } from '@lynx-dev/remote-debug-driver';
import { defaultLogger } from '../../utils';
import { MessageCallback } from './MessageCallback';

export class LDTCLIClient {
  private readonly driver: DebugRouterConnector;
  private readonly disableWss: boolean;
  private messageCallback: MessageCallback | null = null;
  private readonly wssPath: string;
  private readonly roomId: string;
  private fakeSocket: FakeMobileSocket | null = null;
  constructor(driver: DebugRouterConnector, disableWss: boolean, wssPath: string, roomId: string) {
    this.driver = driver;
    this.disableWss = disableWss;
    this.wssPath = wssPath;
    this.roomId = roomId;
    if (this.disableWss) {
      defaultLogger.info('LDTCLIClient use fakeSocket');
      this.fakeSocket = new FakeMobileSocket();
      const clientInfo = {};
      this.fakeSocket.connect(this.wssPath, this.roomId, clientInfo, ClientType.LDTCLI);
      this.fakeSocket.on(ERemoteDebugDriverExternalEvent.All, (msg: any) => {
        // TODO receive message from web, now we can use service of http-server
        // this.onMessage(msg);
      });
    } else {
      // TODO receive message from web, now we can use service of http-server
      this.driver.on('ws-web-message', (payload) => {
        //this.onMessage(payload.message);driver attached
      });
    }
  }
  clientId(): number {
    return this.driver.getDriverClient().clientId();
  }

  sendMessageToWeb(messageType: string, data: string) {
    const message = {
      event: SocketEvent.Customized,
      data: {
        type: messageType,
        data: {
          client_id: -1,
          message: data
        },
        sender: this.clientId()
      }
    };
    defaultLogger.debug('LDTDriverClient sendMessageToWeb:' + JSON.stringify(message));
    if (this.fakeSocket === null) {
      this.driver.sendMessageToWeb(JSON.stringify(message));
    } else {
      this.fakeSocket.emit(message);
    }
  }

  setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
  }

  private onMessage(message: string) {
    this.messageCallback?.onMessage(message);
  }
}
