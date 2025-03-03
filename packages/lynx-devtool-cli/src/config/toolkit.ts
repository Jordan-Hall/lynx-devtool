// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export const DEFAULT_STATIC_SERVE_PORT = 28990;
export const DEFAULT_ROOM_ID = '33ad9856-6085-42e7-80ea-b0c4b5c99b40';
export type FileType = 'trace' | 'lighthouse' | 'testbench';
export enum FileTypes {
  trace = 'trace',
  lighthouse = 'lighthouse',
  testbench = 'testbench'
}

export enum FileSuffixs {
  trace = '.pftrace',
  lighthouse = '.lighthouse',
  testbench = '.testbench'
}

export interface CliOptions {
  logLevel?: number;
  openWebview?: boolean;
  ignoreLDTApp?: boolean;
  disableWSS?: boolean;
  wss?: string;
  room?: string;
  debug?: boolean;
  upgradeChannel?: string;
  runType?: string;
  setupRes?: boolean;
  // query parameters passed to LDT platform
  queryItems?: Record<string, string | undefined>;
  progressListener?: (progress: number) => void;
}
