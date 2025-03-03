// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export enum DevModeTypeLevel {
  none = 0,
  test = 1,
  plugin = 2,
  devtool = 3,
  admin = 4
}
export type DevModeType = keyof typeof DevModeTypeLevel;
export interface DevModeTypeDetail {
  level: DevModeTypeLevel;
  settingKeys: string[];
}

interface DevModeSettingDetailBase {
  label: string;
  description?: string;
}
interface DevModeSettingBooleanDetail extends DevModeSettingDetailBase {
  type: 'boolean';
}
interface DevModeSettingStringDetail extends DevModeSettingDetailBase {
  type: 'string';
}
interface DevModeSettingEnumDetail extends DevModeSettingDetailBase {
  type: 'enum';
  options: Array<{ label: string; value: string; description?: string }>;
}
export type DevModeSettingDetail = DevModeSettingBooleanDetail | DevModeSettingStringDetail | DevModeSettingEnumDetail;

export enum DevModeDevtoolInspectorSource {
  ONLINE = 'ONLINE',
  LOCAL = 'LOCAL',
  TEST = 'TEST',
  PLUGIN = 'PLUGIN'
}
