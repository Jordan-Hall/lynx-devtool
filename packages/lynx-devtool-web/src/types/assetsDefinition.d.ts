// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.scss';
declare module '*.less';
declare module '*.css';
declare module '*.svg';
declare module '*.svg?url';
declare module 'react-copy-to-clipboard';
declare module 'use-sync-external-store/shim';
declare module 'loadjs';
declare module 'xml-js';
declare module 'react-html-parser';

// declare for APIs in electron
interface Window {
  ldtElectronAPI?: {
    send: (name, params) => void;
    invoke: (name, params) => Promise<any>;
    on: (key, listener) => void;
    once: (key, listener) => void;
    off: (key, listener) => void;
  } & Record<string, any>;
}
