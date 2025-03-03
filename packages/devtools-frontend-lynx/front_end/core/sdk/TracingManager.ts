// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable rulesdir/no_underscored_properties */
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Host from '../host/host.js';
import * as Protocol from '../../generated/protocol.js';
import * as ProtocolClient from '../../core/protocol_client/protocol_client.js';
import * as Common from '../../core/common/common.js';

import type {Target} from './Target.js';
import {Capability} from './Target.js';
import {SDKModel} from './SDKModel.js';                // eslint-disable-line no-unused-vars
import type {ObjectSnapshot} from './TracingModel.js'; // eslint-disable-line no-unused-vars

export class TracingManager extends SDKModel {
  _tracingAgent: ProtocolProxyApi.TracingApi;
  _lynxAgent: ProtocolProxyApi.LynxApi;
  _pageAgent: ProtocolProxyApi.PageApi;
  _screencastSetting: Common.Settings.Setting<boolean>;
  _screencastEnabled: boolean;
  _ioAgent: ProtocolProxyApi.IOApi;
  _activeClient: TracingManagerClient|null;
  _eventBufferSize: number|null;
  _eventsRetrieved: number;
  _traceDataSizeMB: number;
  _finishing?: boolean;
  _worker?: Worker;
  _timer?: number;

  constructor(target: Target) {
    super(target);
    this._tracingAgent = target.tracingAgent();
    this._lynxAgent = target.lynxAgent();
    this._pageAgent = target.pageAgent();
    this._screencastSetting = Common.Settings.Settings.instance().settingForTest<boolean>('screencastEnabled');
    this._screencastEnabled = this._screencastSetting.get();
    this._ioAgent = target.ioAgent();
    target.registerTracingDispatcher(new TracingDispatcher(this));

    this._activeClient = null;
    this._eventBufferSize = 0;
    this._eventsRetrieved = 0;
    this._traceDataSizeMB = 0;
  }

  _bufferUsage(usage?: number, eventCount?: number, percentFull?: number): void {
    this._eventBufferSize = eventCount === undefined ? null : eventCount;
    if (this._activeClient) {
      this._activeClient.tracingBufferUsage(usage || percentFull || 0);
    }
  }

  _eventsCollected(events: EventPayload[]): void {
    if (!this._activeClient) {
      return;
    }
    this._activeClient.traceEventsCollected(events);
    this._eventsRetrieved += events.length;
    if (!this._eventBufferSize) {
      this._activeClient.eventsRetrievalProgress(0);
      return;
    }

    if (this._eventsRetrieved > this._eventBufferSize) {
      this._eventsRetrieved = this._eventBufferSize;
    }
    this._activeClient.eventsRetrievalProgress(this._eventsRetrieved / this._eventBufferSize);
  }

  async _tracingComplete(args: Protocol.Tracing.TracingCompleteEvent): Promise<void> {
    let arr = [] as Uint8Array[];
    let totalByteLength = 0;
    this._timer = Date.now();
    const readOptions = {
      handle: args.stream || '',
      size: 1024 * 1024,
    };
    while (true) {
      const piece = await this._ioAgent.invoke_read(readOptions);
      if (!piece) {
        break;
      }
      // @ts-ignore
      const pieceArr = base64js.toByteArray(piece.data);
      arr.push(pieceArr);
      totalByteLength += pieceArr.byteLength;
      this._activeClient?.eventsRetrievalProgress(`${(totalByteLength / (1024 * 1024)).toFixed(2)} MB`);
      if (piece.eof) {
        this._ioAgent.invoke_close({
          handle: args.stream || '',
        });
        break;
      }
    }
    const length = arr.reduce((acc, cur) => (acc + cur.length), 0);
    const response = new Uint8Array(length);
    let idx = 0;
    arr.forEach((unit8arr) => {
      response.set(unit8arr, idx);
      idx += unit8arr.length;
    });
    this._traceDataSizeMB = response.byteLength / (1024 * 1024);
    // trace data transmission completion tracking
    Host.InspectorFrontendHost.reportToStatistics('devtool_panel_performance', {
      type: 'lynx',
      action: 'trace_data_transmit',
      traceDataSizeMBRounded: Math.round(this._traceDataSizeMB),
      // @ts-ignore
      osType: window.info.osType,
      // @ts-ignore
      lynxVersion: window.info.sdkVersion,
    }, {
      traceDataSizeMB: this._traceDataSizeMB,
      traceDataTransTime: (Date.now() - this._timer) / 1000,
      traceDataTransSpeedy: this._traceDataSizeMB / (Date.now() - this._timer) * 1000,
    });

    if (this._screencastEnabled) {
      this._screencastSetting.set(true);
    }
    this._lynxAgent.invoke_setTraceMode({enableTraceMode:false});
    this._pageAgent.invoke_reload({});

    if (!this._worker) {
      this._worker = new Worker(new URL('../../trace/worker.js', import.meta.url), {type: 'module'});
      this._worker.onmessage = (msg: MessageEvent): void => {
        const { data } = msg;
        if (data.type === 'progress') {
          this._activeClient?.eventsRetrievalProgress(data.message, 'Processing');
          return;
        }
        if (this._timer) {
          // trace data conversion completion tracking
          Host.InspectorFrontendHost.reportToStatistics('devtool_panel_performance', {
            type: 'lynx',
            action: 'trace_data_convert',
            traceDataSizeMBRounded: Math.round(this._traceDataSizeMB),
            // @ts-ignore
            osType: window.info.osType,
            // @ts-ignore
            lynxVersion: window.info.sdkVersion,
          }, {
            traceDataSizeMB: this._traceDataSizeMB,
            traceDataConvertTime: (Date.now() - this._timer) / 1000,
            traceDataConvertSpeed: this._traceDataSizeMB / (Date.now() - this._timer) * 1000,
          });
        }
        this._activeClient?.tracingFinished?.({success: true, result: data});
        this._activeClient?.traceNeedConversion?.(false);
        this._activeClient = null;
      };
    }
    this._timer = Date.now();
    this._worker.postMessage(response);
    this._eventBufferSize = 0;
    this._eventsRetrieved = 0;
    if (this._activeClient) {
      this._activeClient?.eventsRetrievalProgress('0 MB');
      this._activeClient.tracingComplete();
      this._activeClient.traceNeedConversion?.(true);
    }
    this._finishing = false;
  }

  // TODO(petermarshall): Use the traceConfig argument instead of deprecated
  // categories + options.
  async start(client: TracingManagerClient, categoryFilter: string, options: string):
      Promise<Protocol.ProtocolResponseWithError> {
    if (this._activeClient) {
      throw new Error('Tracing is already started');
    }
    this._activeClient = client;
    const includedCategories =
        ['lynx', 'vitals', 'disabled-by-default-devtools.timeline.frame', 'disabled-by-default-devtools.timeline', 'jsb', 'javascript'];
    if (Common.Settings.Settings.instance().createSetting('timelineShowScreenshots', false).get()) {
      includedCategories.push('disabled-by-default-devtools.screenshot');
    }
    const enableSystrace = Common.Settings.Settings.instance().createSetting('timelineSystemTrace', false).get();
    if (enableSystrace) {
      includedCategories.push('system');
    }
    const bufferSize = 50 * 1024;
    const args = {
      streamCompression: Protocol.Tracing.StreamCompression.None,
      streamFormat: Protocol.Tracing.StreamFormat.Proto,
      traceConfig: {
        includedCategories,
        excludedCategories: ['*'],
        enableSystrace,
        bufferSize,
      },
      transferMode: Protocol.Tracing.StartRequestTransferMode.ReturnAsStream,
    };

    if (this._screencastEnabled) {
      this._screencastSetting.set(false);
    }
    this._lynxAgent.invoke_setTraceMode({enableTraceMode: true});
    const response = await this._tracingAgent.invoke_start(args);
    if (response.getError()) {
      this._activeClient = null;
      this._lynxAgent.invoke_setTraceMode({enableTraceMode: false});
      if (this._screencastEnabled) {
        this._screencastSetting.set(true);
      }
      // trace start failure tracking
      Host.InspectorFrontendHost.reportToStatistics('devtool_panel_performance', {
        pageType: 'lynx',
        action: 'start_trace',
        result: 'fail',
        reason: response.getError(),
        // @ts-ignore
        osType: window.info.osType,
        // @ts-ignore
        lynxVersion: window.info.sdkVersion,
      });
    } else {
      this._pageAgent.invoke_stopScreencast();
      // trace start success tracking
      Host.InspectorFrontendHost.reportToStatistics('devtool_panel_performance', {
        pageType: 'lynx',
        action: 'start_trace',
        result: 'success',
        // @ts-ignore
        osType: window.info.osType,
        // @ts-ignore
        lynxVersion: window.info.sdkVersion,
      });
    }

    return response;
  }

  async stop(): Promise<void> {
    if (!this._activeClient) {
      throw new Error('Tracing is not started');
    }
    if (this._finishing) {
      throw new Error('Tracing is already being stopped');
    }
    this._finishing = true;
    const response = await this._tracingAgent.invoke_end();
    // @ts-ignore
    if (response[ProtocolClient.InspectorBackend.ProtocolError]) {
      // @ts-ignore
      this._activeClient.tracingFinished?.({success: false, result: response[ProtocolClient.InspectorBackend.ProtocolError]});
    }
  }
}

/**
 * @interface
 */
export interface TracingManagerClient {
  traceEventsCollected(events: EventPayload[]): void;

  tracingComplete(): void;
  tracingBufferUsage(usage: number): void;
  eventsRetrievalProgress(progress: number | string, label?: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tracingFinished?(args: {success: boolean, result?: any}): void;
  traceNeedConversion?(needConversion: boolean): void;
}

class TracingDispatcher implements ProtocolProxyApi.TracingDispatcher {
  _tracingManager: TracingManager;
  constructor(tracingManager: TracingManager) {
    this._tracingManager = tracingManager;
  }

  bufferUsage({value, eventCount, percentFull}: Protocol.Tracing.BufferUsageEvent): void {
    this._tracingManager._bufferUsage(value, eventCount, percentFull);
  }

  dataCollected({value}: Protocol.Tracing.DataCollectedEvent): void {
    this._tracingManager._eventsCollected(value);
  }

  tracingComplete(args: Protocol.Tracing.TracingCompleteEvent): void {
    this._tracingManager._tracingComplete(args);
  }
}

SDKModel.register(TracingManager, {capabilities: Capability.Tracing, autostart: false});
export interface EventPayload {
  cat?: string;
  pid: number;
  tid: number;
  ts: number;
  ph: string;
  name: string;
  args: {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    sort_index: number,
    name: string,
    snapshot: ObjectSnapshot,
    data: Object|null,
  };
  dur: number;
  id: string;
  id2?: {
    global: (string|undefined),
    local: (string|undefined),
  };
  scope: string;
  // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
  // eslint-disable-next-line @typescript-eslint/naming-convention
  bind_id: string;
  s: string;
}
