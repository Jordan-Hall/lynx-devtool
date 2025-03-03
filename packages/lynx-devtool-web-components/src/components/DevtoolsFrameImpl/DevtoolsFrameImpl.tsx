// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable max-lines-per-function */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { createCustomData, ECustomDataType, ICustomDataWrapper } from '@lynx-dev/remote-debug-driver';
import { IDeviceInfo, InspectorType } from '@/types';
import { devtoolActionHandler, getCdpMessageDispatcher, getPluginDriver, getRemoteDebugDriver } from '../../services';
import { useTranslation } from 'react-i18next';

const queryParams = new URLSearchParams(location.search);

export const DevtoolsFrameImpl: React.FC<{
  clientId: number;
  sessionId: number;
  inspectorType: InspectorType;
  landingPage?: React.ReactNode;
  showPanels?: string[];
  info?: IDeviceInfo;
  keepCardOpen?: boolean;
  wsUrl?: string;
  roomId?: string;
  inspectorUrl?: string;
  // TODO: type def use common packages
  plugins?: Record<string, any>[];
}> = (props) => {
  const iframeElement = useRef<HTMLIFrameElement | null>(null);
  const iframeOnMessageRef = useRef<{ onMessage: (event: MessageEvent) => void | null }>();
  const mainWindowOnMessageRef = useRef<{ onMessage: (event: MessageEvent) => void | null }>();
  const [currentSession, setCurrentSession] = useState({ clientId: 0, sessionId: 0, inspectorUrl: '' });
  const { t } = useTranslation();

  const sendGenericMessageToIframe = useCallback((type: string, content?: unknown) => {
    const targetWindow = iframeElement.current?.contentWindow;
    if (!targetWindow) {
      return;
    }
    targetWindow.postMessage({ type, content }, '*');
  }, []);
  const sendMessageToIframe = (message: ICustomDataWrapper<ECustomDataType.CDP>) => {
    const targetWindow = iframeElement.current?.contentWindow;
    if (!targetWindow) {
      return;
    }
    sendGenericMessageToIframe('lynx_message', {
      type: message.type,
      message: message.data.message
    });
  };
  const lynxOpen = useCallback(() => {
    const sessionInfo = props.info?.sessions.find((session) => session.session_id === props.sessionId);
    const data = {
      wsUrl: props.wsUrl,
      roomId: props.roomId,
      sessionId: props.sessionId,
      info: props.info?.info,
      sessionUrl: sessionInfo?.url || ''
    };
    sendGenericMessageToIframe('lynx_open', data);
    setTimeout(() => {
      // Register the message listener of the lynx communication interface
      const messages = getCdpMessageDispatcher().listen4ClientIdAndSessionId(
        props.clientId!,
        props.sessionId!,
        sendMessageToIframe
      );
      getPluginDriver().registerCallback(sendMessageToIframe);
      if (messages) {
        for (const message of messages) {
          sendGenericMessageToIframe('lynx_message', {
            type: message.type,
            message: message.data.message
          });
        }
      }
    }, 0);
  }, [props]);

  const onLoad = useCallback(() => {
    // After receiving the iframe message, call the method in props to process/forward the message
    const onMessage = (event: MessageEvent) => {
      if (!event.data) {
        return;
      }
      // Only process messages from the same sessionId
      if (event.data.sessionId && event.data.sessionId !== props.sessionId) {
        return;
      }

      // Process the communication from the inside to the outside of the iframe
      const { content, type } = event.data;
      if (type) {
        devtoolActionHandler.handle(type, content);
      }

      // TODO: refactor into devtoolActionHandler
      switch (event.data.type) {
        // Initialize data, dynamic plug-in configuration
        case 'iframe_init':
          console.log('iframe init', event);
          sendGenericMessageToIframe('inject_data', {
            info: props.info?.info ?? {},
            plugins: props.plugins ?? []
          });
          break;
        // Compatible with the webview inspector interface
        case 'iframe_loaded':
          console.log('iframe loaded', event);
          lynxOpen();
          break;
        // Call the lynx communication interface to forward the message
        case 'send_message':
          getRemoteDebugDriver().then((driver) => {
            driver.sendCustomMessage(
              createCustomData(content.type, {
                client_id: props.clientId,
                session_id: props.sessionId,
                message: content.message
              })
            );
          });
          break;
        default:
          break;
      }
    };
    iframeOnMessageRef.current = { onMessage };
    window.addEventListener('message', onMessage);

    // Main window message listener
    const mainWindowOnMessage = (event: MessageEvent): void => {
      // Only process messages from the same sessionId
      if (event.data.sessionId && event.data.sessionId !== props.sessionId) {
        return;
      }

      const { content, type } = event.data;
      // a11y business logic
      if (type === 'a11y_mark_lynx') {
        sendGenericMessageToIframe('a11y_mark_lynx', content);
      }
    };
    mainWindowOnMessageRef.current = { onMessage: mainWindowOnMessage };
    window.parent.addEventListener('message', mainWindowOnMessage);
  }, [props]);

  useEffect(() => {
    const onInspectMessage = (event: any, data: any) => {
      sendGenericMessageToIframe('inspect-devtool-message', data);
    };
    if (!props.keepCardOpen || !currentSession.clientId || !currentSession.sessionId) {
      setCurrentSession({
        clientId: props.clientId,
        sessionId: props.sessionId,
        inspectorUrl: `${
          queryParams.get('inspector') ??
          props.inspectorUrl ?? ''
        }?sessionId=${props.sessionId}&ldtVersion=${props.info?.info.ldtVersion}&showPanels=${props.showPanels?.join(
          ','
        )}&dev=${queryParams.get('dev') ?? ''}&sdkVersion=${props.info?.info.sdkVersion}`
      });

      //
      (window as any).ldtElectronAPI?.on('inspect-devtool-message', onInspectMessage);
    }

    return () => {
      if (iframeOnMessageRef.current?.onMessage) {
        window.removeEventListener('message', iframeOnMessageRef.current.onMessage);
        getCdpMessageDispatcher().remove4ChildIdAndSessionId(props.clientId!, props.sessionId!);
      }
      if (mainWindowOnMessageRef.current?.onMessage) {
        window.parent?.removeEventListener('message', mainWindowOnMessageRef.current.onMessage);
      }
      (window as any).ldtElectronAPI?.off('inspect-devtool-message', onInspectMessage);
    };
  }, [props.clientId, props.sessionId, props.inspectorType, props.inspectorUrl]);

  useEffect(() => {
    const frame = iframeElement.current;
    if (frame && (props.info?.info?.containerType || props.info?.info?.engineType)) {
      try {
        const div = frame.contentWindow?.document;
        const screencast = div?.getElementsByClassName('screencast')?.[0];
        if (screencast) {
          screencast.setAttribute('style', 'margin-bottom: 36px');
        }
      } catch (_) {}
    }
  }, [iframeElement.current, props.info?.info?.containerType, props.info?.info?.engineType]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {currentSession.clientId && currentSession.sessionId ? (
        <iframe
          key={currentSession.clientId + currentSession.sessionId}
          style={{ width: '100%', height: '100%' }}
          ref={iframeElement}
          onLoad={onLoad}
          src={currentSession.inspectorUrl}
          frameBorder="0"
        />
      ) : (
        props.landingPage ?? <div>{t('page_not_opened')}</div>
      )}
    </div>
  );
};
