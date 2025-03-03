// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

(window as any).global = window;
// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer || require('buffer').Buffer;
