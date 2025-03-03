// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { EnvLogClient } from '../../types/envLog';
import { EnvLogManager } from '../../utils';

const BATCH_BUFFER_LIMIT = 5;

class FeEnvLogHandler {
  private batchId: number;
  private maxReqBatchId: number;
  private readonly envLogClient: EnvLogClient;
  private flushTimeout: NodeJS.Timeout | null;
  private batchBuffer: Map<number, []>;

  constructor() {
    this.batchId = 0;
    this.maxReqBatchId = 0;
    this.envLogClient = EnvLogManager.initLogClient({ filename: 'frontend' });
    this.flushTimeout = null;
    this.batchBuffer = new Map<number, []>();
  }

  // handler method
  addEnvLogs(reqBatchId: number, logs: []) {
    // This judgment is to cooperate with the circular increment logic of batchId
    if (this.maxReqBatchId - reqBatchId > 10000) {
      this.batchBuffer.forEach((batch) => {
        this.envLogClient.addLogs(batch);
      });
      this.batchBuffer.clear();
      this.maxReqBatchId = reqBatchId;
      this.batchId = 0;
    } else {
      this.maxReqBatchId = Math.max(this.maxReqBatchId, reqBatchId);
    }

    // The late batch arrived first and needs to be cached
    if (this.batchId < reqBatchId && reqBatchId <= this.batchId + BATCH_BUFFER_LIMIT) {
      this.batchBuffer.set(reqBatchId, logs);
      if (!this.flushTimeout) {
        this.flushTimeout = setTimeout(() => {
          this.flushBatchBuffer();
          this.flushTimeout = null;
        }, 5000);
      }
    } else {
      // Correct patch, direct processing
      this.envLogClient.addLogs(logs);
      this._bumpBatchId();
    }

    // flush buffer if needed
    if (this.batchBuffer.size > BATCH_BUFFER_LIMIT) {
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
        this.flushTimeout = null;
      }
      this.flushBatchBuffer();
    } else {
      while (this.batchBuffer.has(this.batchId)) {
        const batchLogs = this.batchBuffer.get(this.batchId)!;
        this.batchBuffer.delete(this.batchId);
        this.envLogClient.addLogs(batchLogs);
        this._bumpBatchId();
      }
    }
  }

  // utils
  flushBatchBuffer() {
    if (this.batchId <= this.maxReqBatchId && this.maxReqBatchId - this.batchId < 10) {
      for (let id = this.batchId; id <= this.maxReqBatchId; id++) {
        if (this.batchBuffer.has(id)) {
          const logs = this.batchBuffer.get(id)!;
          this.envLogClient.addLogs(logs);
        }
      }
      this.batchId = this.maxReqBatchId;
    } else {
      let maxId = 0;
      this.batchBuffer.forEach((logs, id) => {
        maxId = Math.max(maxId, id);
        this.envLogClient.addLogs(logs);
      });
      this.batchId = maxId;
    }
    this.maxReqBatchId = 0;
    this.batchBuffer.clear();
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

const feEnvLogHandler = new FeEnvLogHandler();
export default feEnvLogHandler;
