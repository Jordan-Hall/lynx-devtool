// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export enum EConnectionState {
  Unconnected,
  Connected,
  Unstable,
  Connecting
}

export enum EConnectionPrefix {
  lynx = 'lynx'
}

export enum ESwitchType {
  enableDevtool = 'enable_devtool',
  enableDomTree = 'enable_dom_tree'
}
