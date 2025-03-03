// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export enum DiagnoseItemLevel {
  Critical = 'critical',
  Recommended = 'recommended',
  Info = 'info'
}
export enum DiagnoseItemCheckOperation {
  Equal = 'equal',
  Regex = 'regex'
}
export enum DiagnoseItemType {
  Network = 'network',
  Env = 'env',
  Setting = 'setting'
}
export interface DiagnoseDetailData {
  key: string;
  title: string;
  type: DiagnoseItemType;
  value: string;
  value_std?: string;
  // Add new fields to avoid break change
  value_regex?: string;
  operation?: DiagnoseItemCheckOperation;
  nullable?: boolean;
  level: DiagnoseItemLevel;
  reason?: string;
  suggestion?: string;
  passed?: boolean;
}
