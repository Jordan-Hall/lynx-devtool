// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  ECustomDataType,
  ERemoteDebugDriverExternalEvent,
  ICustomDataWrapper,
  IRemoteDebugServer4Driver
} from '@lynx-dev/remote-debug-driver';
import { ICDPMessageDispatcher } from '../types';

class CDPMessageDispatcher implements ICDPMessageDispatcher {
  private _callbackMap: Map<string, (message: ICustomDataWrapper<ECustomDataType.CDP>) => void> = new Map();
  private _cdpMessagePool: Record<number, Record<number, ICustomDataWrapper<ECustomDataType.CDP>[]>> = {};

  bootstrap(debugDriver: IRemoteDebugServer4Driver) {
    debugDriver.on(ERemoteDebugDriverExternalEvent.All, (payload: any) => {
      const clientId = payload.data?.data?.client_id;
      const sessionId = payload.data?.data?.session_id;
      if (!clientId || !sessionId) {
        return;
      }
      const callback = this._callbackMap.get(`${clientId}:${sessionId}`);
      if (callback) {
        callback(payload.data);
      } else {
        this.pushMessageToPool(clientId, sessionId, payload.data);
      }
    });
  }
  listen4ClientIdAndSessionId(
    clientId: number,
    sessionId: number,
    callback: (cdp: ICustomDataWrapper<ECustomDataType.CDP>) => void
  ) {
    this._callbackMap.set(`${clientId}:${sessionId}`, callback);

    return this.getAndClearMessageFromPool(clientId, sessionId);
  }
  remove4ChildIdAndSessionId(clientId: number, sessionId: number) {
    this._callbackMap.delete(`${clientId}:${sessionId}`);
  }
  private getAndClearMessageFromPool(clientId: number, sessionId: number): ICustomDataWrapper<ECustomDataType.CDP>[] {
    if (!this._cdpMessagePool[clientId]) {
      this._cdpMessagePool[clientId] = { [sessionId]: [] };
      return [];
    }

    const clientPool = this._cdpMessagePool[clientId];
    const messageList = clientPool[sessionId] ?? [];
    clientPool[sessionId] = [];

    return messageList;
  }
  private pushMessageToPool(clientId: number, sessionId: number, message: ICustomDataWrapper<ECustomDataType.CDP>) {
    if (!this._cdpMessagePool[clientId]) {
      this._cdpMessagePool[clientId] = { [sessionId]: [] };
    }
    const clientPool = this._cdpMessagePool[clientId];
    if (!clientPool[sessionId]) {
      clientPool[sessionId] = [];
    }
    clientPool[sessionId].push(message);
  }
}

let dispatcher: ICDPMessageDispatcher | undefined;
export function getCdpMessageDispatcher(): ICDPMessageDispatcher {
  if (!dispatcher) {
    dispatcher = new CDPMessageDispatcher();
  }
  return dispatcher;
}
