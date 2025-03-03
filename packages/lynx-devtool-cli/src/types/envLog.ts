// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export interface EnvLogCategoryObject {
  module: string; // first-level tag
  tag: string; // second-level tag
  extra?: Record<string, any>; // any additional tags
}
export interface EnvLogClient {
  debug: (msg: Record<string, any> | string, categories: EnvLogCategoryObject) => void;
  info: (msg: Record<string, any> | string, categories: EnvLogCategoryObject) => void;
  warn: (msg: Record<string, any> | string, categories: EnvLogCategoryObject) => void;
  error: (msg: Record<string, any> | string, categories: EnvLogCategoryObject) => void;
  log: (level: EnvLogLevelType, msg: string | Record<string, any>, categories: EnvLogCategoryObject) => void;
  addLogs: (logs: EnvLogObject[]) => void;
}

export enum EnvLogLevelType {
  Info = 'info',
  Debug = 'debug',
  Warn = 'warn',
  Error = 'error'
}
export interface EnvLogObject {
  level: EnvLogLevelType;
  module: string;
  tag: string;
  msg: string | Record<string, any>;
  // millisecond timestamp
  timestamp: number;
  extra?: Record<string, any>;
}
