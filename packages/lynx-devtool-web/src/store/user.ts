// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import i18n from '@/i18n/i18n';
import create from '../utils/flooks';
import { isOfflineMode } from '@/utils/const';

export type UserStoreType = ReturnType<typeof userStore>;
const userStore = (store: any) => ({
  language: i18n.language,
  user: {},
  appId: localStorage.getItem('app_id'),
  showRecommandBanner: !isOfflineMode() && localStorage.getItem('has_show_banner') !== 'true',
  recommandBannerClosed: sessionStorage.getItem('has_close_banner') === 'true',
  bannerPrefix: '',

  setAppId(appId: string) {
    localStorage.setItem('app_id', appId);
    store({ appId });
  },

  setShowRecommandBanner(showRecommandBanner: boolean, bannerPrefix = '') {
    if (isOfflineMode()) {
      return;
    }
    const { recommandBannerClosed } = store() as UserStoreType;
    if (showRecommandBanner && recommandBannerClosed) {
      return;
    }
    localStorage.setItem('has_show_banner', 'true');
    store({ showRecommandBanner, bannerPrefix });
  },

  closeRecommandBanner(recommandBannerClosed: boolean) {
    const { setShowRecommandBanner } = store() as UserStoreType;
    sessionStorage.setItem('has_close_banner', `${recommandBannerClosed}`);
    store({ recommandBannerClosed });
    setShowRecommandBanner(false);
  }
});

const useUser = create(userStore);
export default useUser;
