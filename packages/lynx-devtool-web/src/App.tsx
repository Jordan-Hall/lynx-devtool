// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import NavMenu from '@/components/NavMenu/NavMenu';
import { ConfigProvider, message } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import { BrowserRouter } from '@modern-js/runtime/router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './App.scss';
import { HeaderWrapper } from './components/Header/Header';
import UnattachedDialog from './components/UnattachedDialog/UnattachedDialog';
import Router from './router';
import useConnection from './store/connection';
import useServer from './store/server';
import useUser from './store/user';
import { initLastOpReport } from './utils/report';
import { sendStatisticsEvent } from './utils/statisticsUtils';
import { isInMobilePageMode } from './utils/const';

const App = (): JSX.Element => {
  const { webSocketHost, roomId } = useServer();
  const { openConnection } = useConnection();
  const { t } = useTranslation();
  const { language } = useUser();

  const locale = useMemo(() => {
    // TODO: support i18n later
    return enUS;
  }, [language]);
  sendStatisticsEvent({
    name: 'ldt_launch_language_setting',
    categories: {
      language: locale.locale
    }
  });

  useEffect(() => {
    initLastOpReport();
  }, []);

  useEffect(() => {
    if (window.location.href.startsWith('https://')) {
      const didTryReplace = sessionStorage.getItem('didTryReplaceHTTPS') === 'true';
      const content = didTryReplace ? (
        <a>
          {t('https_fix_suggestions')}
        </a>
      ) : (
        <a>{t('https_will_try_replace')}</a>
      );
      message.error({
        content,
        duration: 0
      });
      if (!didTryReplace) {
        setTimeout(() => {
          sessionStorage.setItem('didTryReplaceHTTPS', 'true');
          window.location.href = window.location.href.replace('https://', 'http://');
        }, 3000);
      }
    }
  }, []);

  useEffect(() => {
    openConnection(webSocketHost, roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webSocketHost, roomId]);

  return (
    <ConfigProvider locale={locale}>
      <BrowserRouter>
        <main>
          {isInMobilePageMode() ? <NavMenu /> : <></>}
          <div className="container-box">
            {isInMobilePageMode() ? <HeaderWrapper /> : <></>}
            {/* Header is not displayed in 3.0 scenarios, and DevMode entry needs to be displayed separately */}
            <div className="content-box" id="ldt-content">
              <Router />
            </div>
          </div>
          <UnattachedDialog />
        </main>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
