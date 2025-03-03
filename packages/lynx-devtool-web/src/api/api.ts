// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


import { showAdbError, showExistServerError } from '@/utils/notice';
import axios from 'axios';
import { isOfflineMode } from '../utils/const';
import { getSelectClient } from '../utils/storeUtils';
import envLogger from '@/utils/envLogger';
import { FileType } from '@/types';

export async function renameLocalFile(oldName: string, newName: string) {
  return await axios.get(
    `/renameLocalFile?oldName=${oldName}&newName=${newName}` // ignore_security_alert
  );
}

export async function deleteLocalFile(fileName: string) {
  return await axios.get(
    `/deleteLocalFile?fileName=${fileName}` // ignore_security_alert
  );
}

// Restart ldt service
export async function restartLdtServer() {
  return await axios.get('/restartServer');
}

// checkAdb
export async function checkAdb() {
  try {
    const res = await axios.get('/checkAdb'); // ignore_security_alert
    if (res?.data?.code !== 0) {
      // ADB exception, prompt the user
      showAdbError();
    }
  } catch (error: any) {
    console.error('checkAdb error', error);
  }
}

export async function checkExistServer() {
  const res = await axios.get('/checkExistServer'); // ignore_security_alert
  if (res?.data?.code === 0) {
    // showerror
    showExistServerError();
  }
}

export async function openUrlExternal(url: string) {
  return await axios.get(`/openUrlExternal?url=${url}`); // ignore_security_alert
}

// Get the intranet ip
export async function queryIntranetIp(lan = false) {
  return await axios.get(`/queryIntranetIp?lan=${lan}`); // ignore_security_alert
}

export async function getLDTVersion() {
  return await axios.get(`/getVersion`); // ignore_security_alert
}

export async function getGitInfo() {
  return await axios.get(`/getGitInfo`); // ignore_security_alert
}

export async function uploadEnvLogs(): Promise<string[]> {
  // Currently only available in the offline version
  if (!isOfflineMode()) {
    return Promise.resolve([]);
  }

  // flush cache logs before upload
  await envLogger.flushEnvLogs();
  const { info } = getSelectClient() ?? {};
  const resp = await axios.post('/uploadEnvLogs', {
    appId: info?.appId,
    did: info?.did
  });
  const { code, data } = resp.data;
  return code === 0 ? data : [];
}

export async function firstConnectionMade(appId: string) {
  return await axios.post('/firstConnectionMade', { appId });
}

export async function getConfigItemByKey(key: string) {
  try {
    const resp = await axios.get(`/getConfigItemByKey?key=${encodeURIComponent(key)}`);
    const { code, value } = resp.data;
    if (code === 0) {
      return value;
    }
  } catch (error) {}
  return undefined;
}
