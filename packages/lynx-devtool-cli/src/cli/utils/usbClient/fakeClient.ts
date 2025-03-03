// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { DebugRouterConnector, UsbClient } from '@lynx-dev/debug-router-connector';
import { ERemoteDebugDriverExternalEvent } from '@lynx-dev/remote-debug-driver';
import FakeMobileSocket, { ClientType } from './fakeMobileSocket';

const usbToFakeSocket: Map<number, FakeMobileSocket> = new Map();

function handleUsbClientDisConnect(clientId: number) {
  const fakeSocket = usbToFakeSocket.get(clientId);
  if (fakeSocket) {
    fakeSocket.disconnect();
    usbToFakeSocket.delete(clientId);
  }
}

export function handleUsbMessage(payload: { id: number; message: string }) {
  const { id, message } = payload;
  const fakeSocket = usbToFakeSocket.get(id);
  if (fakeSocket) {
    // TODO: Fix the logic in the Speedy WS Room (refactor: Speedy WS Room will be replaced by DebugRouterConnector)
    // In certain cases, the Speedy WS Room returns the message sent by the USB client back to the same USB client.
    // However, the DebugRouter cannot handle the response of the "App" message.
    // When the USB client sends the response of the "App" message to the Speedy WS Room, the Speedy WS Room mistakenly forwards
    // this message back to the USB client, resulting in a crash of the DebugRouter.
    const msgJsonObj = JSON.parse(message);
    if (msgJsonObj?.data?.type === 'App') {
      return;
    }
    fakeSocket.emit(msgJsonObj);
  }
}

async function handleUsbClientConnect(client: UsbClient, wssPath: string, roomId: string, driver: DebugRouterConnector) {
  if (wssPath && roomId) {
    const fackSocket = new FakeMobileSocket();
    const clientInfo = client.info.query.raw_info ?? {};
    clientInfo.network = 'USB';
    clientInfo.usbDeviceId = client.info.query.device_id;
    await fackSocket.connect(wssPath, roomId, clientInfo, ClientType.RunTime);

    fackSocket.on(ERemoteDebugDriverExternalEvent.Close, () => {
      client.close();
    });

    fackSocket.on(ERemoteDebugDriverExternalEvent.All, (msg: any) => {
      client.sendMessage(msg);
      driver.emit('ws-web-message', { id: msg.sender, message: msg });
    });
    client.on('data', (msg) => {
      fackSocket.emit(msg);
    });
    usbToFakeSocket.set(client.clientId(), fackSocket);
  }
}

export function initDebugRouterConnector(driver: DebugRouterConnector, wssPath: string, roomID: string) {
  if (driver) {
    driver.on('client-connected', (payload: UsbClient) => {
      handleUsbClientConnect(payload, wssPath, roomID, driver);
    });

    driver.on('client-disconnected', (clientId: number) => {
      handleUsbClientDisConnect(clientId);
    });

    driver.on('usb-client-message', (payload) => {
      handleUsbMessage(payload);
    });
  }
}
