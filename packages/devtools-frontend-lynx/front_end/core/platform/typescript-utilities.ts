// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This is useful to keep TypeScript happy in a test - if you have a value
 * that's potentially `null` you can use this function to assert that it isn't,
 * and satisfy TypeScript that the value is present.
 */
export function assertNotNullOrUndefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === null || val === undefined) {
    throw new Error(`Expected given value to not be null/undefined but it was: ${val}`);
  }
}

/**
 * This is useful to check on the type-level that the unhandled cases of
 * a switch are exactly `T` (where T is usually a union type of enum values).
 * @param caseVariable
 */
export function assertUnhandled<T>(_caseVariable: T): T {
  return _caseVariable;
}

export type FieldsThatExtend<Type, Selector> = {
  [Key in keyof Type]: Type[Key] extends Selector ? Key : never;
}[keyof Type];

export type PickFieldsThatExtend<Type, Selector> = Pick<Type, FieldsThatExtend<Type, Selector>>;
