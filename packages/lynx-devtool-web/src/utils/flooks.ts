// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

// MIT License

// Copyright (c) 2020 nanxiaobei https://github.com/nanxiaobei

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

let run = (fn: () => void) => {
  fn();
};
const __DEV__ = window.process?.env?.NODE_ENV !== 'production';

type State = Record<string, any>;
type GetSetStore<T> = {
  (): T;
  (s: Partial<T> | ((state: T) => Partial<T>)): void;
};
type InitStore<T> = (getSetStore: GetSetStore<T>) => T;

const map = new WeakMap();

export const getStore = <T extends State>(initStore: InitStore<T>): T => {
  return map.get(initStore);
};

const create = <T extends State>(initStore: InitStore<T>): (() => T) => {
  if (__DEV__ && typeof initStore !== 'function') {
    throw new Error('Expected a function');
  }

  let store: T;
  let useStore: any = null;
  const listeners = new Set<(partial: Partial<T>) => void>();

  function getSetStore(s?: unknown) {
    if (typeof s === 'undefined') {
      return store;
    }
    const partial = typeof s === 'function' ? s(store) : s;
    store = { ...store, ...partial };
    map.set(useStore, store);
    run(() => listeners.forEach((listener) => listener(partial)));
  }

  store = initStore(getSetStore as GetSetStore<T>);

  useStore = function () {
    const proxy = useRef<T>({} as T);
    const handler = useRef<ProxyHandler<T>>({});
    const hasState = useRef(false);
    const hasUpdate = useRef(false);
    const [, setState] = useState(false);

    useMemo(() => {
      handler.current = {
        get(target: T, key: keyof T) {
          const val = store[key];

          if (typeof val !== 'function') {
            hasState.current = true;
            target[key] = val;
            return target[key];
          }

          target[key] = new Proxy(val, {
            get: (fn: any, fnKey) => {
              if (fnKey === 'loading' && !('loading' in fn)) {
                fn.loading = false;
              }
              return fn[fnKey];
            },

            apply: (fn, _this, args) => {
              const res = fn(...args);
              if (!('loading' in fn) || !res || typeof res.then !== 'function') {
                target[key] = fn;
                return res;
              }

              const setLoading = (loading: boolean) => {
                target[key].loading = loading;
                setState((s) => !s);
              };

              target[key] = ((...newArgs: unknown[]) => {
                const newRes = fn(...newArgs);
                setLoading(true);
                return newRes.finally(() => setLoading(false));
              }) as T[keyof T];

              setLoading(true);
              return res.finally(() => setLoading(false));
            }
          });

          return target[key];
        },

        set(target: T, key: keyof T, val: T[keyof T]) {
          if (key in target && val !== target[key]) {
            hasUpdate.current = true;
            target[key] = val;
          }
          return true;
        }
      } as ProxyHandler<T>;

      proxy.current = new Proxy({} as T, handler.current);
    }, []);

    useEffect(() => {
      handler.current.get = (target: T, key: string) => target[key];
    }, []);

    const subscribe = useCallback((update: () => void) => {
      if (!hasState.current) {
        return () => undefined;
      }

      const listener = (partial: Partial<T>) => {
        Object.assign(proxy.current, partial);
        if (hasUpdate.current) {
          hasUpdate.current = false;
          update();
        }
      };

      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []);

    const getSnapshot = useCallback(() => store, []);
    useSyncExternalStore(subscribe, getSnapshot);

    return proxy.current;
  };
  map.set(useStore, store);
  return useStore;
};

create.config = ({ batch }: { batch: typeof run }) => {
  run = batch;
};

export default create;
