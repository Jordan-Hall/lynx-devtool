// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export type OS = 'iOS' | 'Android';
export type Netwok = 'USB' | 'WiFi' | null;
export type IPropsLanguage = 'typescript' | 'schema' | 'json' | 'javascript' | 'plaintext' | 'xml' | 'html' | 'css';

export type DeviceInfo = {
  deviceId: string;
  name: string;
  platform: OS;
};

export type ServerState = {
  isConnect: boolean;
  delay: number;
  connecting: boolean;
  useVpnIp: boolean;
  totalDelay: number;
};

export type FileType = 'trace' | 'lighthouse' | 'testbench';
export type IOReadParams = {
  handle: string;
  size: number;
};

export type ImagesInfo = {
  type: string;
  key: string;
  url: string;
  fetch_time: string;
  image_url: string;
  memory_cost: number;
  fetch_cost_time: number;
  complete_cost_time: number;
  is_memory: boolean;
  view_width: number;
  view_height: number;
  image_width: number;
  image_height: number;
  config: string;
};
