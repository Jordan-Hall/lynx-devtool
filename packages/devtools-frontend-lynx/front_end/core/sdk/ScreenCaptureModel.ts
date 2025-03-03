// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable rulesdir/no_underscored_properties */

import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import * as Common from '../common/common.js';

import {OverlayModel} from './OverlayModel.js';
import type {Target} from './Target.js';
import {Capability} from './Target.js';
import {SDKModel} from './SDKModel.js';
import { envLogger } from '../protocol_client/InspectorBackend.js';

export class ScreenCaptureModel extends SDKModel implements ProtocolProxyApi.PageDispatcher {
  _agent: ProtocolProxyApi.PageApi;
  _screencastAckTimeout: any;
  _cachedScreencastFrame: Protocol.Page.ScreencastFrameEvent | null;
  _onScreencastFrame: ((arg0: Protocol.binary, arg1: Protocol.Page.ScreencastFrameMetadata) => void)|null;
  _onScreencastVisibilityChanged: ((arg0: boolean) => void)|null;
  constructor(target: Target) {
    super(target);
    this._agent = target.pageAgent();
    this._screencastAckTimeout = null;
    this._cachedScreencastFrame = null;
    this._onScreencastFrame = null;
    this._onScreencastVisibilityChanged = null;
    target.registerPageDispatcher(this);
  }

  startScreencast(
      format: Protocol.Page.StartScreencastRequestFormat, quality: number, maxWidth: number|undefined,
      maxHeight: number|undefined, everyNthFrame: number|undefined,
      onFrame: (arg0: Protocol.binary, arg1: Protocol.Page.ScreencastFrameMetadata) => void,
      onVisibilityChanged: (arg0: boolean) => void): void {
    this._onScreencastFrame = onFrame;
    this._onScreencastVisibilityChanged = onVisibilityChanged;
    const mode = Common.Settings.Settings.instance().createSetting<string>("pageScreencastMode", 'fullscreen').get();
    this._agent.invoke_startScreencast({format, quality, maxWidth, maxHeight, everyNthFrame, mode});
    if (this._cachedScreencastFrame) {
      this.screencastFrame(this._cachedScreencastFrame);
      envLogger.info("CachedScreencastFrame is used to call onScreencastFrame", {
        tag: 'Screencast'
      });
    }
  }

  stopScreencast(): void {
    this._onScreencastFrame = null;
    this._onScreencastVisibilityChanged = null;
    this._agent.invoke_stopScreencast();
  }

  async captureScreenshot(
      format: Protocol.Page.CaptureScreenshotRequestFormat, quality: number,
      clip?: Protocol.Page.Viewport): Promise<string|null> {
    await OverlayModel.muteHighlight();
    const result = await this._agent.invoke_captureScreenshot(
        {format, quality, clip, fromSurface: true, captureBeyondViewport: true});
    await OverlayModel.unmuteHighlight();
    return result.data;
  }

  async fetchLayoutMetrics(): Promise<{
    viewportX: number,
    viewportY: number,
    viewportScale: number,
    contentWidth: number,
    contentHeight: number,
  }|null> {
    const response = await this._agent.invoke_getLayoutMetrics();
    if (response.getError()) {
      return null;
    }
    return {
      viewportX: response.cssVisualViewport.pageX,
      viewportY: response.cssVisualViewport.pageY,
      viewportScale: response.cssVisualViewport.scale,
      contentWidth: response.cssContentSize.width,
      contentHeight: response.cssContentSize.height,
    };
  }

  screencastFrame({data, metadata, sessionId}: Protocol.Page.ScreencastFrameEvent): void {
    // Cache the last screenshot, and render the cached screenshot first when restarting the screenshot next time
    this._cachedScreencastFrame = {
      data,
      metadata,
      sessionId
    };
    // Execute screenshot rendering first to reduce white screen time
    if (this._onScreencastFrame) {
      this._onScreencastFrame.call(null, data, metadata);
      envLogger.info("call onScreencastFrame callback", {
        tag: 'Screencast'
      });
    } else {
      console.error("onScreencastFrame callback is not binded.");
      envLogger.error("onScreencastFrame callback is not binded.", {
        tag: 'Screencast'
      });
    }
    // Delay execution of ack message reply according to FPS settings
    const FPS = parseInt(Common.Settings.Settings.instance().moduleSetting<string>('screencastFPS').get());
    const ackWaitTime = 1000 / FPS;
    if (this._screencastAckTimeout) {
      clearTimeout(this._screencastAckTimeout);
    }
    this._screencastAckTimeout = setTimeout(() => {
      this._screencastAckTimeout = null;
      this._agent.invoke_screencastFrameAck({sessionId});
    }, ackWaitTime);
  }

  screencastVisibilityChanged({visible}: Protocol.Page.ScreencastVisibilityChangedEvent): void {
    if (this._onScreencastVisibilityChanged) {
      this._onScreencastVisibilityChanged.call(null, visible);
    }
  }

  backForwardCacheNotUsed(_params: Protocol.Page.BackForwardCacheNotUsedEvent): void {
  }

  domContentEventFired(_params: Protocol.Page.DomContentEventFiredEvent): void {
  }

  loadEventFired(_params: Protocol.Page.LoadEventFiredEvent): void {
  }

  lifecycleEvent(_params: Protocol.Page.LifecycleEventEvent): void {
  }

  navigatedWithinDocument(_params: Protocol.Page.NavigatedWithinDocumentEvent): void {
  }

  frameAttached(_params: Protocol.Page.FrameAttachedEvent): void {
  }

  frameNavigated(_params: Protocol.Page.FrameNavigatedEvent): void {
  }

  documentOpened(_params: Protocol.Page.DocumentOpenedEvent): void {
  }

  frameDetached(_params: Protocol.Page.FrameDetachedEvent): void {
  }

  frameStartedLoading(_params: Protocol.Page.FrameStartedLoadingEvent): void {
  }

  frameStoppedLoading(_params: Protocol.Page.FrameStoppedLoadingEvent): void {
  }

  frameRequestedNavigation(_params: Protocol.Page.FrameRequestedNavigationEvent): void {
  }

  frameScheduledNavigation(_params: Protocol.Page.FrameScheduledNavigationEvent): void {
  }

  frameClearedScheduledNavigation(_params: Protocol.Page.FrameClearedScheduledNavigationEvent): void {
  }

  frameResized(): void {
  }

  javascriptDialogOpening(_params: Protocol.Page.JavascriptDialogOpeningEvent): void {
  }

  javascriptDialogClosed(_params: Protocol.Page.JavascriptDialogClosedEvent): void {
  }

  interstitialShown(): void {
  }

  interstitialHidden(): void {
  }

  windowOpen(_params: Protocol.Page.WindowOpenEvent): void {
  }

  fileChooserOpened(_params: Protocol.Page.FileChooserOpenedEvent): void {
  }

  compilationCacheProduced(_params: Protocol.Page.CompilationCacheProducedEvent): void {
  }

  downloadWillBegin(_params: Protocol.Page.DownloadWillBeginEvent): void {
  }

  downloadProgress(): void {
  }
}

SDKModel.register(ScreenCaptureModel, {capabilities: Capability.ScreenCapture, autostart: false});
