// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { getStore } from './flooks';
import useConnection from '@/store/connection';
import useUser from '@/store/user';

// Client related
export const getSelectClient = () => {
  const { selectedDevice } = getStore(useConnection);
  return selectedDevice;
};

export const getSelectClientInfo = () => {
  const { selectedDevice, deviceInfoMap } = getStore(useConnection);
  if (selectedDevice.clientId) {
    return deviceInfoMap[selectedDevice.clientId];
  } else {
    return null;
  }
};

export const getSelectClientId = () => {
  return getSelectClient().clientId;
};

export const getClientWithId = (clientId: number) => {
  const { deviceInfoMap } = getStore(useConnection);
  return deviceInfoMap[clientId];
};

export const getSelectSession = () => {
  return getClientWithId(getSelectClientId() ?? -1)?.selectedSession;
};

export const getUser = () => {
  return getStore(useUser).user;
};
