// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { LevelType } from '@/types/log';
import axios from 'axios';
import { isOfflineMode } from './const';
import { sendStatisticsEvent } from './statisticsUtils';

export interface EnvLogCategoryObject {
  module: string; // first-level tag
  tag: string; // second-level tag
  timestamp?: number; // timestamp, if not transmitted, it will be generated in log
  extra?: Record<string, any>; // any additional tags
}
export interface EnvLogObject {
  level: LevelType;
  module: string;
  tag: string;
  msg: string | Record<string, any>;
  // millisecond timestamp
  timestamp: number;
  extra?: Record<string, any>;
}

const CACHE_LOG_LIMIT = 50;
const CACHE_LOG_FLUSH_TIMEOUT_MS = 10000;

class EnvLogger {
  private cacheLogs: EnvLogObject[];
  private batchId: number;
  private flushTimeout: NodeJS.Timeout | null;

  constructor() {
    this.cacheLogs = [];
    this.batchId = 0;
    this.flushTimeout = null;
  }

  // log methods
  debug(msg: Record<string, any> | string, categories: EnvLogCategoryObject) {
    this.log(LevelType.Debug, msg, categories);
  }
  info(msg: Record<string, any> | string, categories: EnvLogCategoryObject) {
    this.log(LevelType.Info, msg, categories);
  }
  warn(msg: Record<string, any> | string, categories: EnvLogCategoryObject) {
    this.log(LevelType.Warn, msg, categories);
  }
  error(msg: Record<string, any> | string, categories: EnvLogCategoryObject) {
    this.log(LevelType.Error, msg, categories);
  }
  log(level: LevelType, msg: Record<string, any> | string, categories: EnvLogCategoryObject) {
    // currently only available in offline version
    if (!isOfflineMode()) {
      return;
    }

    const log = this._assembleEnvLogObject(level, msg, categories);
    this.cacheLogs.push(log);

    // flush cache logs if needed
    if (this.cacheLogs.length < CACHE_LOG_LIMIT) {
      if (!this.flushTimeout) {
        this.flushTimeout = setTimeout(() => {
          this.flushEnvLogs();
          this.flushTimeout = null;
        }, CACHE_LOG_FLUSH_TIMEOUT_MS);
      }
    } else {
      this.flushEnvLogs();
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
        this.flushTimeout = null;
      }
    }
  }

  async flushEnvLogs(): Promise<void> {
    if (this.cacheLogs.length === 0) {
      return;
    }

    const logs = this.cacheLogs;
    this.cacheLogs = [];
    try {
      await axios.post('/addEnvLogs', {
        logs,
        batchId: this._bumpBatchId()
      });
    } catch (err: any) {
      sendStatisticsEvent({
        name: 'ldt_env_log',
        categories: {
          type: 'addEnvLogs',
          result: 'fail',
          reason: err
        }
      });
    }
  }

  // utils
  private _assembleEnvLogObject(
    level: LevelType,
    msg: Record<string, any> | string,
    categories: EnvLogCategoryObject
  ): EnvLogObject {
    const { module, tag, timestamp = Date.now(), extra = {} } = categories;
    return {
      level,
      module,
      tag,
      msg,
      timestamp,
      extra
    };
  }
  private _bumpBatchId(): number {
    if (this.batchId === Number.MAX_VALUE) {
      this.batchId = 0;
    } else {
      this.batchId++;
    }
    return this.batchId;
  }
}

const envLogger = new EnvLogger();
export default envLogger;
