// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { IDevice } from '@/types/device';
import compareVersions from 'compare-versions';

export function canUseDebugRouter(device: IDevice): boolean {
  const { info } = device;
  if (info?.ldtVersion) {
    if (info?.osType === 'Android') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '1.5.1') >= 0;
    }
    if (info?.osType === 'iOS') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '1.5.4.2') >= 0;
    }
  }
  return true;
}

export function canUseALogUpload(device: IDevice) {
  const { info } = device;
  if (info?.ldtVersion) {
    if (info?.osType === 'Android') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '2.0.32') >= 0;
    }
    if (info?.osType === 'iOS' || info?.osType === 'Mac') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '7.2.0') >= 0;
    }
  }
  return false;
}

export function canUseCardDebug(device: IDevice) {
  const { info } = device;
  if (info?.ldtVersion) {
    if (info?.osType === 'Android') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '2.1.0') >= 0;
    }
    if (info?.osType === 'iOS' || info?.osType === 'Mac') {
      return compareVersions.validate(info.ldtVersion) && compareVersions(info.ldtVersion, '7.8.0-rc.5') >= 0;
    }
  }
  return false;
}
