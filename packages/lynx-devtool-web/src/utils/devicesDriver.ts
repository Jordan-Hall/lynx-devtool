// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { IDevice } from "@/types/device";
import debugDriver from "./debugDriver";

export function isSameDevice(first: IDevice, second: IDevice) {
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
