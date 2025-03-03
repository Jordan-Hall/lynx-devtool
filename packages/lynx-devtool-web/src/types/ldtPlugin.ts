// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

// TODO: common package for sharing type definitions across ldt packages
export interface LDTPlatformPluginForUser {
  _id: string;
  name: string;
  type: string;
  url: string;
  location: string;
  isValid: string;
}
