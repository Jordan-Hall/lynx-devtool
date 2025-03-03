// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

declare global {
  interface Window {
    process: {
      env: {
        NODE_ENV: string;
        LDT_BUILD_TYPE?: string;
        BUILD_VERSION?: string;
      };
      platform: string;
      versions: {
        node: string;
        electron: string;
      };
    };
  }
}