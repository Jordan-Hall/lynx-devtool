// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { IRemoteDebugServer4Driver, createRemoteDebugDriver } from '@lynx-dev/remote-debug-driver';
import { getCdpMessageDispatcher } from './batcher';

let debugDriverInstance: IRemoteDebugServer4Driver | null = null;
let debugDriverInitPromise: Promise<IRemoteDebugServer4Driver> | null = null;

let cancelId = 0;
export function bootstrapRemoteDriver(
  url?: string,
  room?: string
): Promise<IRemoteDebugServer4Driver> {
  if (debugDriverInstance) {
    debugDriverInstance.stop();
    debugDriverInstance = null;
  }

  cancelId++;
  const id = cancelId;
  // try to create a debug server connection Promise
  const wsUrl = url;
  if (!wsUrl) {
    throw new Error('Cannot create remote debug driver without wsUrl');
  }
  let timer: NodeJS.Timeout | null = null;
  const createDriver = new Promise<IRemoteDebugServer4Driver>((resolve, reject) => {
    createRemoteDebugDriver(wsUrl, room).then((debugDriver) => {
      if (timer) {
        clearTimeout(timer);
      }
      if (id === cancelId) {
        getCdpMessageDispatcher().bootstrap(debugDriver);
        debugDriverInstance = debugDriver;
        resolve(debugDriver);
      } else {
        debugDriver.stop();
        reject(new Error('connection closed because a new connection is initialized.'));
      }
    });
  });
  // timeout Promise
  const timeout = new Promise<IRemoteDebugServer4Driver>((_, reject) => {
    timer = setTimeout(() => {
      console.error(`Failed to create connection with ${wsUrl}${room ? `&room=${room}` : ''}`);
      reject(new Error('connection timeout (10 seconds).'));
    }, 10000);
  });

  // async call will end if created successfully or timed out
  debugDriverInitPromise = Promise.race([createDriver, timeout]);
  return debugDriverInitPromise;
}

export function getRemoteDebugDriver(): Promise<IRemoteDebugServer4Driver> {
  if (debugDriverInstance) {
    return Promise.resolve(debugDriverInstance);
  } else if (debugDriverInitPromise) {
    return debugDriverInitPromise;
  } else {
    return Promise.reject(new Error('devtool is not connected'));
  }
}
