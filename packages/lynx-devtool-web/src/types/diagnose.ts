// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { DiagnoseDetailData, DiagnoseItemType } from '@lynx-dev/lynx-devtool-utils';

export type DiagnoseReport = {
  [key in DiagnoseItemType]?: DiagnoseDetailData[];
};
export enum DiagnoseItemColor {
  Critical = '#e92828',
  Recommended = '#ef9e2c',
  Info = '#464545',
  Normal = '#09a318'
}
export enum DiagnoseReportSource {
  Platform = 'platform',
  Device = 'device'
}
