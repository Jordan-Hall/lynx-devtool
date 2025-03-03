// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  ECustomDataType,
  ICustomDataWrapper,
  IRemoteDebugServer4Driver
} from '@lynx-dev/remote-debug-driver';

export interface ISessionInfo {
  url: string;
  session_id: number;
  type: 'web' | 'lynx' | '' | string;
}

export interface IDeviceInfo {
  clientId?: number;
  sessions: ISessionInfo[];
  info: {
    [key: string]: any;
    did?: string;
    appId?: string;
    App: string;
    AppVersion: string;
    deviceModel: string;
    network: string;
    osType?: string;
    osVersion: string;
    sdkVersion: string;
    ldtVersion?: string;
  };
}

export interface ICDPMessageDispatcher {
  bootstrap: (debugDriver: IRemoteDebugServer4Driver) => void;
  listen4ClientIdAndSessionId: (
    clientId: number,
    sessionId: number,
    callback: (cdp: ICustomDataWrapper<ECustomDataType.CDP>) => void
  ) => ICustomDataWrapper<ECustomDataType.CDP>[];
  remove4ChildIdAndSessionId: (clientId: number, sessionId: number) => void;
}
