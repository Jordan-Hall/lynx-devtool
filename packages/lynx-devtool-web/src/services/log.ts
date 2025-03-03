// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import xdbDriver from '../utils/xdbDriver';

function throttle(fn: any, delay: any, bufferSize = 10): any {
  const buffer = [] as any[];
  let timer: any = null;
  return function () {
    buffer.unshift(arguments[0]);
    if (buffer.length >= bufferSize) {
      fn(buffer);
      buffer.length = 0;
      return;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      if (buffer.length > 0) {
        fn(buffer);
        buffer.length = 0;
      }
    }, delay);
  };
}

const normalTime = (s: any) => {
  return s < 10 ? `0${s}` : s;
};

export function timeFormat(time: any) {
  const d = time ? new Date(time) : new Date();
  const year = d.getFullYear();
  const month = normalTime(d.getMonth() + 1);
  const day = normalTime(d.getDate());
  const hours = normalTime(d.getHours());
  const min = normalTime(d.getMinutes());
  const seconds = normalTime(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${min}:${seconds}`;
}

export function changeLogStatus(status: boolean, types: Array<string>): Promise<any> {
  return xdbDriver.sendMessage({
    type: 'xdb_change_log_status',
    data: { status, types }
  });
}
