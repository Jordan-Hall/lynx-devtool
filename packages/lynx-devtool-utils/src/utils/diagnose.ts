// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { DiagnoseItemCheckOperation, DiagnoseDetailData, DiagnoseItemLevel } from '@/types';

// Determine whether the diagnostic item has passed
export const canItemPassDiagnose = (item: DiagnoseDetailData): boolean => {
  // Return true directly for info type
  if (item.level === DiagnoseItemLevel.Info) {
    return true;
  }

  // TODO: The old version does not have the operation field
  const { value, value_std, value_regex = '', operation = DiagnoseItemCheckOperation.Equal, nullable } = item;
  // nullable
  if (nullable) {
    if (value === undefined) {
      return true;
    }
  }

  // compare based on operation
  let result = false;
  switch (operation) {
    case DiagnoseItemCheckOperation.Equal:
      if (value_std === undefined) {
        result = true;
      } else {
        result = value === value_std;
      }
      break;
    case DiagnoseItemCheckOperation.Regex:
      try {
        // Prevent illegal regular expressions from causing errors
        result = new RegExp(value_regex).test(String(value));
      } catch (err) {
        result = false;
      }
      break;
    default:
      break;
  }

  return result;
};
