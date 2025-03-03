// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import * as fs from 'fs-extra';
import { QueueObject, queue, each } from 'async';
import { getEnvLogPath } from '../cli/utils';
import { defaultLogger } from './logger';
import { EnvLogCategoryObject, EnvLogClient, EnvLogLevelType, EnvLogObject } from '../types/envLog';

// env log client implementation class
class EnvLogClientImpl implements EnvLogClient {
  private readonly queue: QueueObject<EnvLogObject>;
  private fileSizeCount: number;
  readonly filePath: string;

  constructor(options: { filePath: string }) {
    const { filePath } = options;
    this.filePath = filePath;
    fs.writeFileSync(this.filePath, new Date().toDateString(), {
      flag: 'w'
    });
    this.fileSizeCount = 0;
    this.queue = queue(({ level, module, tag, msg, timestamp, extra = {} }, cb) => {
      const timeString = this._getTimeString(timestamp);
      let logString = `\n[${timeString}][${level}][${module}][${tag}][${extra ? JSON.stringify(extra) : ''}]`;
      logString += typeof msg === 'object' ? JSON.stringify(msg) : msg;
      const logLength = logString.length;
      if (this.fileSizeCount + logLength > 1024 * 1024 * 100) {
        fs.writeFileSync(this.filePath, new Date().toDateString());
        this.fileSizeCount = 0;
      }
      fs.appendFile(this.filePath, logString, (err) => {
        this.fileSizeCount += logLength;
        cb(err);
      });
    }, 1);
  }

  // log methods
  debug(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    this.log(EnvLogLevelType.Debug, msg, categories);
  }
  info(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    this.log(EnvLogLevelType.Info, msg, categories);
  }
  warn(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    this.log(EnvLogLevelType.Warn, msg, categories);
  }
  error(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    this.log(EnvLogLevelType.Error, msg, categories);
  }
  log(level: EnvLogLevelType, msg: string | Record<string, any>, categories: EnvLogCategoryObject) {
    // waiting task limit 1000, prevent node crash when unexpected problems cause queue accumulation
    if (this.queue.length() > 1000) {
      // TODO: tracking point
      return;
    }
    const logObj = this._assembleLogObject(level, msg, categories);
    this.queue.push(logObj);
  }
  addLogs(logs: EnvLogObject[]): void {
    this.queue.push(logs);
  }

  // upload file to storage
  async uploadLogFile(namePrefix?: string): Promise<string> {
    // TODO(sunkai.dev): create data uploader instance

    // process queued tasks first
    if (this.queue.length() > 0) {
      await this.queue.drain();
    }
    // copy file
    this.queue.pause();
    const snapshotFilePath = this.filePath + '.snapshot';
    fs.copyFileSync(this.filePath, snapshotFilePath);
    this.queue.resume();
    // upload file
    let url = '';
    const fileName = this.filePath.slice(this.filePath.lastIndexOf('/') + 1);
    try {
      // [ldt_env_log]{namePrefix}-{timestamp}-{randomNumber}_filename
      defaultLogger.debug(`upload log file to storage, filename: ${snapshotFilePath}`);
      defaultLogger.debug(
        `[ldt_env_log]${namePrefix ?? ''}-${Date.now()}-${Math.round(Math.random() * 10000)}_${fileName}`
      );
      // TODO(sunkai.dev): upload file to storage
    } catch (error) {
      defaultLogger.error('Env log file upload error. Use local file path instead.');
      url = snapshotFilePath;
    }

    return url;
  }

  // utils
  // assemble log object, insert timestamp
  private _assembleLogObject(
    level: EnvLogLevelType,
    msg: string | Record<string, any>,
    categories: EnvLogCategoryObject
  ): EnvLogObject {
    const { module, tag, extra = {} } = categories;
    const timestamp = Date.now();
    return {
      level,
      module,
      tag,
      msg,
      timestamp,
      extra
    };
  }

  // transform 13-digit timestamp to HH:mm:ss.SSS format string
  private _getTimeString(timestamp: number) {
    if (!timestamp) {
      return '0:0:0.000';
    }
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
  }
}

// env log client class with empty implementation
// used when env log function is disabled
class EnvLogClientImplEmpty implements EnvLogClient {
  constructor() {
    defaultLogger.debug('Empty log client is provided because EnvLog feature is disabled.');
  }
  debug(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    return;
  }
  info(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    return;
  }
  warn(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    return;
  }
  error(msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    return;
  }
  log(level: EnvLogLevelType, msg: string | Record<string, any>, categories: EnvLogCategoryObject): void {
    return;
  }
  addLogs(logs: EnvLogObject[]): void {
    return;
  }
}

// EnvLogManager is responsible for managing all log client instances
const envLogClients: EnvLogClientImpl[] = [];
export class EnvLogManager {
  static initLogClient(options?: { filename: string }): EnvLogClient {
    // provide empty implementation class when the environment variable switch disables the EnvLog function
    if (process.env.LDT_ENV_LOG_DISABLE) {
      defaultLogger.warn('LDT EnvLog feature is disabled.');
      return new EnvLogClientImplEmpty();
    }

    const envLogPath = getEnvLogPath();
    if (!fs.existsSync(envLogPath)) {
      fs.mkdirSync(envLogPath, { recursive: true });
    }
    const name = options?.filename
      ? options.filename.endsWith('.log')
        ? options.filename
        : options.filename + '.log'
      : 'env_log_default.log';
    const filePath = `${envLogPath}/${name}`;
    const existClient = envLogClients.find((client) => client.filePath === filePath);
    if (existClient) {
      return existClient;
    }
    const newClient = new EnvLogClientImpl({ filePath });
    envLogClients.push(newClient);
    return newClient;
  }

  static async uploadLogFiles(namePrefix?: string): Promise<string[]> {
    // log prompt when the environment variable switch disables the EnvLog function
    if (process.env.LDT_ENV_LOG_DISABLE) {
      defaultLogger.warn('No file to upload because EnvLog feature is disabled.');
      return Promise.reject(new Error('No file to upload because EnvLog feature is disabled.'));
    }

    const fileUrlList: string[] = [];
    await each(envLogClients, (client, callback) => {
      client.uploadLogFile(namePrefix).then((result) => {
        fileUrlList.push(result);
        callback();
      });
    });
    return fileUrlList;
  }
}
