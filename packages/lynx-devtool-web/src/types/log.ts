// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable no-prototype-builtins */

export enum LevelType {
  Verbose = 'verbose',
  Info = 'info',
  Debug = 'debug',
  Error = 'error',
  Warn = 'warn',
  Fatal = 'fatal'
}

export const LevelArray = ['verbose', 'debug', 'info', 'warn', 'error', 'fatal'];

export const LevelArrayRecord: Record<string, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};

export interface IOfflineLogType {
  tag: string;
  level: number;
  module: string;
  message: string;
  date: number;

  ev_type?: string;
  bid?: string;
  hit_sample?: boolean;
  url?: string;
  phase?: [];
  schema?: string;
  navigation_id?: string;
}

export interface LogBaseInfoType {
  isSelect: boolean;
  value: string | Array<any>;
}

export enum LogSchema {
  sdk_version = 'sdk_version',
  sdk_name = 'sdk_name',
  os = 'os',
  ev_types = 'ev_types',
  url = 'url',
  schema = 'schema',
  navigation_id = 'navigation_id'
}

export const initLogSchemaValue: Record<LogSchema, LogBaseInfoType> = {
  sdk_version: { isSelect: false, value: '' },
  sdk_name: { isSelect: false, value: '' },
  os: { isSelect: false, value: '' },
  ev_types: { isSelect: false, value: [] },
  url: { isSelect: false, value: '' },
  schema: { isSelect: false, value: '' },
  navigation_id: { isSelect: false, value: '' }
};

export const Ev_type2Description: Record<string, string> = {
  ajax: 'ajax network request',
  perf: 'page performance data',
  resource_performance: 'static resource request',
  static: 'static resource loading exception',
  js_exception: 'js exception',
  performance: 'web&lynx performance',
  containerError: 'container error',
  blank: 'white screen',
  fetchError: 'fetch request exception',
  custom: 'custom report',
  jsbError: 'JSB exception',
  nativeError: 'general native error',
  res_loader_info: 'resource loading monitoring',
  res_loader_perf: 'resource loading monitoring',
  res_info: 'resource loading monitoring',
  res_loader_perf_template: 'resource loading monitoring',
  res_loader_error_template: 'resource loading monitoring',
  res_loader_error: 'resource loading monitoring',
  jsbPerf: 'JSB call',
  falconPerf: 'Falcon link monitoring',
  prefetchPerf: 'prefetchPerf monitoring',
  navigationStart: 'page starts loading'
};
