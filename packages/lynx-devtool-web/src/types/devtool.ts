// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import LDT_CONST from '@/utils/const';
import { DevModeDevtoolInspectorSource } from './devmode';

export interface IDevtoolLoadingProgress {
  timestamp: number;
  type: string; // TODO: enum DevtoolLoadingProgressType
  message?: Record<string, any>;
}

export enum BizPageContainerType {
  Unknown = 'unknown'
}
