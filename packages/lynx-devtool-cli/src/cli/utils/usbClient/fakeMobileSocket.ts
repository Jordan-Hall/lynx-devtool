// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  ERemoteDebugDriverExternalEvent,
  IRemoteDebugServer4Driver,
  RemoteDebugDriver
} from '@lynx-dev/remote-debug-driver';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';
import { defaultLogger } from '../../../utils';
import { createRemoteDebugDriver } from './usbSocket';

export const enum ClientType {
  Driver = 'Driver', // web
  RunTime = 'runtime', // app
  LDTCLI = 'LDTCLI'
}

const lynxTransferTypeData = {
  event: 'Customized',
  data: {
    type: 'CDP',
    data: {
      session_id: 1,
      client_id: -1,
      message: {
        method: 'Lynx.transferData',
        params: {
          dataType: 'template',
          data: '',
          eof: false
        }
      }
    },
    sender: 1
  },
  from: 1
};

interface FragmentParams {
  fromPageDataFragments: boolean;
  pageDataLength: number;
  timestamp: number;
}

async function getTemplateJsBuffer(url: string, urlParentPath: string): Promise<any> {
  let newTemplateJsPath = '';
  let oldTemplateJsPath = '';
  if (url.indexOf('http') === 0) {
    const urlData = new URL(url);
    const IPath = urlData.pathname.substring(0, urlData.pathname.indexOf('template.js') + 11);
    oldTemplateJsPath = urlData.href.substring(0, urlData.href.indexOf('template.js') + 11);
    newTemplateJsPath = urlParentPath !== undefined ? path.join(urlParentPath, IPath) : '';
  } else {
    const newUrl = decodeURIComponent(url.substring(url.indexOf('http'), url.indexOf('template.js') + 11));
    const urlData = new URL(newUrl);
    const IPath = urlData.pathname.substring(0, urlData.pathname.indexOf('template.js') + 11);
    oldTemplateJsPath = urlData.href.substring(0, urlData.href.indexOf('template.js') + 11);
    newTemplateJsPath = urlParentPath !== undefined ? path.join(urlParentPath, IPath) : '';
  }
  let result: any = null;
  // The old version of CLI has defects in taking local paths, so it is changed to front-end download, before 2.27.1
  if (newTemplateJsPath === '') {
    const data = await fetch(oldTemplateJsPath); // ignore_security_alert_wait_for_fix SSRF
    result = data.arrayBuffer();
  }
  // Corrected by the new version of CLI
  else {
    result = fs.readFileSync(newTemplateJsPath); // ignore_security_alert_wait_for_fix FILE_OPER
  }
  return result;
}

export default class FakeMobileSocket {
  private fakeMobileSocketClient?: RemoteDebugDriver | null;
  private fakeMobileClientInitPromise?: Promise<RemoteDebugDriver> | null;

  connect(wsPath: string, roomId: string, clientInfo: any, clientType: ClientType) {
    this.fakeMobileClientInitPromise = createRemoteDebugDriver(wsPath, clientType, roomId, clientInfo).then(
      (data: IRemoteDebugServer4Driver) => {
        const driver = data as RemoteDebugDriver;
        this.fakeMobileSocketClient = driver;
        return Promise.resolve(driver);
      }
    );
  }

  async disconnect() {
    await this.fakeMobileSocketClient?.stop();
    this.fakeMobileSocketClient = null;
    this.fakeMobileClientInitPromise = null;
  }

  getFakeMobileClient(): Promise<RemoteDebugDriver> {
    if (this.fakeMobileSocketClient) {
      return Promise.resolve(this.fakeMobileSocketClient);
    } else if (this.fakeMobileClientInitPromise) {
      return this.fakeMobileClientInitPromise;
    } else {
      return Promise.reject(new Error('please init the fake client first'));
    }
  }

  emit(payload?: any) {
    this.getFakeMobileClient()
      .then((client) => {
        if (payload?.data?.data?.client_id) {
          payload.data.data.client_id = client.getDeviceId();
        }
        if (payload?.data?.sender) {
          payload.data.sender = client.getDeviceId();
        }
        if (payload) {
          client.sendMessage(payload.data);
          // console.log("to ws:", payload);
        }
      })
      .catch((e: Error) => {
        defaultLogger.error(e.message);
      });
  }

  on(eventName: ERemoteDebugDriverExternalEvent, listener: (args: any) => void): this {
    this.getFakeMobileClient()
      .then((client) => {
        client.on(eventName, (payload: any) => {
          if (payload?.data?.data?.client_id) {
            payload.data.data.client_id = -1;
          }
          if (this.isPageReloadEvent(payload)) {
            this.handlePageReloadEvent(payload, listener);
          } else {
            listener(payload);
          }
          // console.log("to usb:", payload);
        });
      })
      .catch((e) => {
        defaultLogger.error(e.message);
      });
    return this;
  }

  private isPageReloadEvent(msg: any): boolean {
    return (
      msg?.data?.data?.message && JSON.stringify(msg.data.data.message).includes('Page.reload') && msg?.data?.data?.url
    );
  }

  private async handlePageReloadEvent(msg: any, listener: (args: any) => void) {
    let templateData = Buffer.from(await getTemplateJsBuffer(msg.data?.data.url, msg.data?.data.path));

    // When the template is less than a certain value, transfer directly
    if (templateData.length < 1024000) {
      const params = {
        pageData: templateData.toString('base64'),
        timestamp: Date.now()
      };

      const messageData = JSON.parse(msg.data.data.message);
      messageData.params = params;
      msg.data.data.message = messageData;

      listener(msg);
    }
    // When the template is greater than a certain value, transfer in segments
    else {
      // Send relevant messages first to confirm that it is a segmented transfer
      const messageData = JSON.parse(msg.data.data.message);

      const params: FragmentParams = {
        fromPageDataFragments: true,
        pageDataLength: templateData.length,
        timestamp: Date.now()
      };
      messageData.params = params;
      msg.data.data.message = messageData;

      // Record the sessionId of this transfer, and the session_id needs to be updated in the segment
      const sessionId = msg.data.data.session_id;
      listener(msg);

      // Send segmented messages
      while (templateData.length > 1024000) {
        const fragmentData = lynxTransferTypeData;
        fragmentData.data.data.message.params.data = templateData.toString('base64', 0, 1024000);
        fragmentData.data.data.message.params.eof = false;
        fragmentData.data.data.session_id = sessionId;
        listener(fragmentData);
        templateData = templateData.slice(1024000);
      }

      // Send the last data
      const lastFragmentData = lynxTransferTypeData;
      lastFragmentData.data.data.message.params.data = templateData.toString('base64');
      lastFragmentData.data.data.message.params.eof = true;
      lastFragmentData.data.data.session_id = sessionId;
      listener(lastFragmentData);
    }
  }
}
