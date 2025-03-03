// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { defaultLogger } from '../../utils';
import {
  MultiOpenCallback,
  MultiOpenStatus
} from '@lynx-dev/debug-router-connector';
import { LDTCLIClient } from './LDTDriverClient';

export class LDTMultiOpenCallback implements MultiOpenCallback {
  private readonly driverClient: LDTCLIClient;
  constructor(driverClient: LDTCLIClient) {
    this.driverClient = driverClient;
  }
  statusChanged(status: MultiOpenStatus): void {
    defaultLogger.info('MultiOpen status:' + status);
    if (status === MultiOpenStatus.unattached) {
      this.driverClient.sendMessageToWeb('sync_unattached', '');
      defaultLogger.warn('This LDT process has been paused because another LDT process was started.');
    } else if (status === MultiOpenStatus.attached) {
      defaultLogger.info('This LDT process is ready.');
    } else {
      defaultLogger.error('LDTMultiOpenCallback: illegal status: unInit');
    }
  }
}
