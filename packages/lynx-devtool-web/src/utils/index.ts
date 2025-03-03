// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { FileType, IPropsLanguage } from '@/types';
import axios from 'axios';
import { Buffer } from 'buffer';
import FormData from 'form-data';
import { queryService } from './query';
import * as reduxUtils from './storeUtils';
import { IDevice } from '@/types/device';
import { queryIntranetIp } from '@/api/api';

const separator = '___';

export function getQueryVariable(variable: string) {
  return queryService.getQuery(variable);
}

export function jsonEscape(str: string) {
  if (!str) {
    return str;
  }
  return str.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '');
}

export const getDocumentMetaInfo = (name: string) => {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content');
};

export const getRoomId = () => {
  const key = 'roomId';
  const roomId = getDocumentMetaInfo(key);
  return roomId ? roomId : getQueryVariable(key);
};

export const getWssPort = () => {
  return getQueryVariable('wssPort') ?? '9783';
};

export const getWsUrl = () => {
  return `ws://localhost:${getWssPort()}/mdevices/page/android`;
};

export async function uploadFileBufferToLocal(buffer: Array<Buffer>, fileName = '', type: FileType) {
  const form = new FormData();
  form.append('file', new Blob(buffer), fileName);
  form.append('type', type);
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  };
  const res = await axios.post('/uploadFileToLocal', form, config);
  return Promise.resolve(res.data);
}

export async function getCurrentIntranetIp(useLan = false) {
  try {
    const res = await queryIntranetIp(useLan);
    if (res?.status === 200) {
      return res?.data?.data;
    } else {
      console.error('queryIntranetIp error', res);
      return null;
    }
  } catch (error) {
    console.error('queryIntranetIp error', error);
    return null;
  }
}

export const getViewType = () => {
  const key = 'viewType';
  const viewType = getDocumentMetaInfo(key);
  return viewType ? viewType : getQueryVariable(key);
};

export const getDeviceNetwork = (network: string) => {
  return network === 'USB' ? network : 'WiFi';
};

export const downloadFile = (url: any) => {
  const eleLink = document.createElement('a');
  eleLink.style.display = 'none';
  eleLink.href = url;
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
};

export function getFileName() {
  const client: any = reduxUtils.getSelectClient();
  let fileName = `${client?.info?.App}(${client?.info?.deviceModel})${separator}${new Date().toISOString()}`;
  // trim
  fileName = `${fileName.replace(/\s*/g, '')}`;
  return fileName;
}

export function zeroFill(n: number): string {
  return 0 <= n && n <= 9 ? `0${n}` : `${n}`;
}

export function dateString(data: Date) {
  const numbers = [];
  numbers.push(zeroFill(data.getFullYear()));
  numbers.push(zeroFill(data.getMonth() + 1));
  numbers.push(zeroFill(data.getDate()));
  numbers.push(zeroFill(data.getHours()));
  numbers.push(zeroFill(data.getMinutes()));
  numbers.push(zeroFill(data.getSeconds()));
  numbers.push(zeroFill(data.getMilliseconds()));
  return numbers.join('-');
}

export function getQueries(url: string = location.href): any {
  const query: any = {};
  try {
    const search = new URL(url).search.substring(1);
    if (search && search.length > 0) {
      const vars = search.split('&');
      vars.forEach((item) => {
        const pair = item.split('=');
        query[pair[0]] = pair[1];
      });
    }
  } catch (e) {}
  return query;
}

export function getQuery(key: string, query: string = location.search): string | null {
  if (query.startsWith('?')) {
    // eslint-disable-next-line no-param-reassign
    query = query.substring(1);
  }
  const vars = query.split('&');
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === key) {
      return pair[1];
    }
  }
  return null;
}

export function getHeader(headers: any | null, key: string): string {
  if (!headers) {
    return '';
  }
  const findKey = Object.keys(headers).find((item) => item.toLowerCase() === key);
  if (findKey) {
    return headers[findKey];
  } else {
    return '';
  }
}

export function getContentType(headers: any): string {
  return getHeader(headers, 'content-type');
}

export function getLanguage(contentType?: string): IPropsLanguage {
  if (contentType?.includes('json')) {
    return 'json';
  }
  if (contentType?.includes('xml')) {
    return 'xml';
  }
  if (contentType?.includes('javascript')) {
    return 'javascript';
  }
  if (contentType?.includes('html')) {
    return 'html';
  }
  if (contentType?.includes('typescript')) {
    return 'typescript';
  }
  if (contentType?.includes('css')) {
    return 'css';
  }
  if (contentType?.includes('text')) {
    return 'plaintext';
  }
  if (contentType?.includes('schema')) {
    return 'schema';
  }
  return 'json';
}

export const getAppProcess = (device: IDevice) => {
  const { info } = device;
  if (info?.AppProcessName) {
    const arr = info.AppProcessName.split(':');
    if (arr.length === 2) {
      return `:${arr[1]}`;
    }
  }
  return null;
};
