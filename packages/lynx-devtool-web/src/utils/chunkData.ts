// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const NEW_LINE = '\r\n';

export interface ChunkData {
  key: string;
  value: string;
}

export const isHexadecimal = (str: string) => {
  const regex = /^[0-9A-Fa-f]+$/g;
  return regex.test(str);
};

export function getDataLength(value: string) {
  return Buffer.from(value).byteLength.toString(16);
}

export function buildChunkData(value: string): ChunkData {
  return {
    key: getDataLength(value),
    value
  };
}

export function parseChunkData(value?: string) {
  const datas: ChunkData[] = [];
  if (!value) {
    return datas;
  }
  const arr = value.split(NEW_LINE);
  let k = '';
  let v = '';
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 1) {
      v = arr[i];
      datas.push({ key: k, value: v });
    } else {
      k = arr[i];
      // If k is not a hexadecimal file, it means this is not a chunkstream, If it is \r\n, it means the last line.
      if (!isHexadecimal(k) || k === NEW_LINE) {
        return datas;
      }
    }
  }
  return datas;
}

export function stringifyChunkData(chunks: ChunkData[]): string {
  let str = '';
  chunks.forEach((chunk) => {
    str += `${chunk.key}${NEW_LINE}${chunk.value}${NEW_LINE}`;
  });
  return str;
}

export function isChunkResponse(response: any) {
  return response.headers['tt_api_type'] === 'STREAM_FORECAST';
}
