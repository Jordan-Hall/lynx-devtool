// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import create from '@/utils/flooks';
import axios from 'axios';

export type UnattachedStoreType = ReturnType<typeof unattachedStore>;

const unattachedStore = (store: any) => ({
  isDisplay: false,
  reconnect: () => {
    console.log('reconnect');
    store({ isDisplay: false });
    axios
      .get('/reconnect')
      .then((result: any) => {
        console.log('reconnect:' + JSON.stringify(result));
      })
      .catch((error: any) => {
        console.log('reconnect:' + error?.message);
      });
  },
  display: () => {
    console.log('display');
    store({ isDisplay: true });
  }
});

const useUnattached = create(unattachedStore);
export default useUnattached;
