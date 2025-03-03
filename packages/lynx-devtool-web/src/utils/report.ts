// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable max-nested-callbacks */
import { sendStatisticsEvent } from './statisticsUtils';

export enum EventType {
  Disconnect = 'Disconnect'
}

let lastOpTime = Date.now();
let isLastOpInited = false;
export function initLastOpReport() {
  if (isLastOpInited) {
    return;
  }
  isLastOpInited = true;
  function updateLastOpTime() {
    lastOpTime = Date.now();
  }
  document.addEventListener('click', function (event) {
    updateLastOpTime();
  });
  document.addEventListener('keydown', function (event) {
    updateLastOpTime();
  });
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME' && !(node as any)._added_click_keydown_listener) {
            node.addEventListener('load', (e: any) => {
              (node as any)._added_click_keydown_listener = true;
              try {
                e.target.contentWindow.document.addEventListener('click', function () {
                  updateLastOpTime();
                });
                e.target.contentWindow.document.addEventListener('keydown', function () {
                  updateLastOpTime();
                });
              } catch (_) {}
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export function reportTimeSinceLastOp(event: EventType) {
  console.log('timeSinceLastOp:', Date.now() - lastOpTime);
  sendStatisticsEvent({
    name: 'ldt_time_since_last_op',
    categories: {
      hostname: window.location.hostname,
      timeSinceLastOp: `${Date.now() - lastOpTime}`,
      eventType: event.toString()
    }
  });
}
