// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export interface StatisticsCustomEventData {
  name: string;
  // Value must be string, otherwise it will not be reported
  categories?: Record<string, string>;
  // Value must be number, otherwise it will not be reported
  metrics?: Record<string, number>;
}
