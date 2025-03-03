// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 *
 * APIs available in LDT Electron App only
 */

async function call<T = any>(name: string, params?: any): Promise<T> {
  if (!window.ldtElectronAPI) {
    return Promise.reject(new Error('Electron API not found'));
  }
  try {
    const { code, data, msg } = await window.ldtElectronAPI.invoke(name, params);
    if (code === 0) {
      return Promise.resolve(data as T);
    } else {
      return Promise.reject(new Error(msg));
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export function restartLDTPlatformInElectron() {
  if (window.ldtElectronAPI?.call) {
    call('restart-ldt-platform');
  } else {
    if (!window.ldtElectronAPI) {
      console.warn('Electron API not found');
      return;
    }
    window.ldtElectronAPI.restartLDTPlatform();
  }
}

// Update custom JSB
export function updateJsbImpl(jsbName: string, content: string) {
  return call('jsb-impl-config', {
    action: 'update-impl',
    jsbName,
    content
  });
}
// Read custom JSB list
export function getJsbImplConfig() {
  return call<Record<string, { isActive: boolean }>>('jsb-impl-config', {
    action: 'get-config'
  });
}
// Toggle custom JSB
export function toggleJsbImpl(jsbName: string) {
  return call('jsb-impl-config', {
    action: 'toggle-impl',
    jsbName
  });
}
// Read custom JSB implementation content
export function readJsbImpl(jsbName: string) {
  return call<string>('jsb-impl-config', {
    action: 'read-impl',
    jsbName
  });
}
// Delete custom JSB implementation
export function deleteJsbImpl(jsbName: string) {
  return call('jsb-impl-config', {
    action: 'delete-impl',
    jsbName
  });
}
// Rename custom JSB implementation file
export function renameJsbImpl(jsbNameOld: string, jsbNameNew: string) {
  return call('jsb-impl-config', {
    action: 'rename-impl',
    jsbNameOld,
    jsbNameNew
  });
}

// Update custom GlobalProps
export function updateGlobalPropsImpl(content: string) {
  return call('globalprops-impl-config', {
    action: 'update-impl',
    content
  });
}
// Read custom GlobalProps
export function readGlobalPropsImpl() {
  return call<string>('globalprops-impl-config', {
    action: 'read-impl'
  });
}
// Update custom AppInfo
export function updateAppInfoImpl(content: string) {
  return call('app-info-impl-config', {
    action: 'update-impl',
    content
  });
}
// Read custom AppInfo
export function readAppInfoImpl() {
  return call('app-info-impl-config', {
    action: 'read-impl'
  });
}

export function pcLogin() {
  return call('pc-login', {});
}

export function getUserList() {
  return call('user', { action: 'list' });
}

export function removeUser(uid: string) {
  return call('user', { action: 'remove', uid });
}

export function selectUser(uid: string) {
  return call('user', { action: 'select', uid });
}

export function setAppEnv(env: { channle: string; env: string }) {
  return call('env-config', { action: 'set', data: env });
}

export function getAppEnv() {
  return call('env-config', { action: 'get' });
}

export function sendEventToSimulator(data: any) {
  return call('devtool-inspect-message', data);
}

export function fetchInstancePluginListFromLDT3() {
  return call('get-instance-plugin-list');
}
