// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { queryService } from './query';

const KEY_AUTO_FOCUS_LAST_SESSION = 'autoFocusOnLastSession';
const TRACING_EVENT_COMPLETE = 'Tracing.tracingComplete';
const TESTBENCH_EVENT_COMPLETE = 'Recording.recordingComplete';
const TRACING_METHOD_START = 'Tracing.start';
const TRACING_METHOD_END = 'Tracing.end';
const TRACING_IO_READ = 'IO.read';
const EVENT_CUSTOMIZED = 'Customized';
const EVENT_PING = 'Ping';
const EVENT_PONG = 'Pong';
const MEMORY_EVENT_UPLOADIMAGEINFO = 'Memory.uploadImageInfo';
const APP_RUNTIME_TYPE = 'app_runtime_type';
const SYNC_UNATTACHED = 'sync_unattached';

export function getBuildVersion() {
  return (window as any).process?.env?.BUILD_VERSION;
}

export function isOfflineMode() {
  const windowProcess = typeof (window as any).process === 'string' 
    ? JSON.parse((window as any).process)
    : (window as any).process;
  console.info('window.process (original):', (window as any).process);
  console.info('windowProcess (parsed):', windowProcess);
  console.info('windowProcess.env:', windowProcess.env);
  console.info('windowProcess.env.LDT_BUILD_TYPE:', windowProcess.env?.LDT_BUILD_TYPE);
  return windowProcess.env?.LDT_BUILD_TYPE === 'offline';
}

export function getRuntimeType() {
  const queryType = queryService.getQuery('type');
  // query value transmission priority
  if (queryType) {
    sessionStorage.setItem(APP_RUNTIME_TYPE, queryType);
    return queryType;
  }

  let runtimeType: string | null;
  if (!isOfflineMode()) {
    runtimeType = 'online';
  } else {
    runtimeType = sessionStorage.getItem(APP_RUNTIME_TYPE);
    if (!runtimeType) {
      runtimeType = 'unknown';
    }
  }
  sessionStorage.setItem(APP_RUNTIME_TYPE, runtimeType);

  return runtimeType;
}

export function isInElectron() {
  return Boolean(window.ldtElectronAPI);
}

export function getDebugMode() {
  let cardMode = queryService.getQuery('debugMode');
  if (cardMode) {
    sessionStorage.setItem('__debug_mode', cardMode);
  } else {
    cardMode = sessionStorage.getItem('__debug_mode');
  }
  return cardMode;
}

export function getPageMode() {
  let pageMode = queryService.getQuery('pageMode');
  if (pageMode) {
    sessionStorage.setItem('__page_mode', pageMode);
  } else {
    pageMode = sessionStorage.getItem('__page_mode');
  }
  return pageMode ?? '0';
}

export function getViewMode() {
  let pageMode = queryService.getQuery('viewMode');
  if (pageMode) {
    sessionStorage.setItem('__view_mode', pageMode);
  } else {
    pageMode = sessionStorage.getItem('__view_mode');
  }
  return pageMode ?? 'lynx';
}

export function isInMobilePageMode() {
  return getPageMode() === '0';
}

const DEVTOOL_INSPECTOR_URL = {
  lynxOFFLINE: `http://${window.location.host}/localResource/devtool/lynx/inspector.html`,
};

const MSG_ScreenshotCaptured = 'Lynx.screenshotCaptured';
const MSG_SetGlobalSwitch = 'SetGlobalSwitch';
const MSG_GetGlobalSwitch = 'GetGlobalSwitch';
const MSG_SELECT_SESSION = 'selectSession';
const MSG_SET_CARD_FILTER = 'LDT.setCardFilter';

const LDT_CONST = {
  KEY_AUTO_FOCUS_LAST_SESSION,
  EVENT_CUSTOMIZED,
  EVENT_PING,
  EVENT_PONG,
  TRACING_EVENT_COMPLETE,
  TESTBENCH_EVENT_COMPLETE,
  TRACING_METHOD_START,
  TRACING_METHOD_END,
  TRACING_IO_READ,
  MSG_ScreenshotCaptured,
  MSG_SetGlobalSwitch,
  MSG_GetGlobalSwitch,
  MSG_SELECT_SESSION,
  MEMORY_EVENT_UPLOADIMAGEINFO,
  SYNC_UNATTACHED,
  MSG_SET_CARD_FILTER,
  DEVTOOL_INSPECTOR_URL
};

export default LDT_CONST;
