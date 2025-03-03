// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useUser from '@/store/user';
import { Alert, Typography, ConfigProvider } from 'antd';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import DeviceSelect from '../DeviceSelect/DeviceSelect';
import ConnectButton from './ConnectButton';
import './Header.scss';
import { useLocation } from '@modern-js/runtime/router';
import { useEffect, useState } from 'react';
import { getConfigItemByKey } from '@/api/api';
import { isInMobilePageMode, isOfflineMode } from '@/utils/const';

const { Link } = Typography;

const HEADER_CONTENT_ID = 'ldt-header-content';
let headerContentDiv: HTMLElement | null = null;

const HeaderWrapper = () => {
  const token = {
    marginXS: 8,
    colorPrimary: '#1890ff'
  };
  const { closeRecommandBanner, showRecommandBanner, bannerPrefix } = useUser();
  const { t } = useTranslation();
  const location = useLocation();
  const [showConnectBtn, setShowConnectBtn] = useState(true);
  const [region, setRegion] = useState('');

  const handleBannerClose = () => {
    closeRecommandBanner(true);
  };

  useEffect(() => {
    setShowConnectBtn(!location.pathname.startsWith('/lynx/'));

    // init region
    getConfigItemByKey('region').then((selectRegion) => {
      if (selectRegion === 'cn') {
        setRegion('cn');
      } else {
        setRegion('i18n');
      }
    });
  }, [location]);

  return (
    <div>
      <div id="notifyBannerMsgStart" />
      {showRecommandBanner && (
        <Alert
          message={
            <>
              {bannerPrefix}
              {t('offline_recommand')}
              <Link
                href="https://github.com/lynx-infra/lynx-devtool"
                target="_blank"
                style={{ color: token.colorPrimary }}
              >
                LDT 2.0
              </Link>
            </>
          }
          closable
          onClose={handleBannerClose}
          style={{
            padding: 6
          }}
          type="info"
        />
      )}
      <div className="ldt-header">
        {isInMobilePageMode() && (
          <>
            <ConnectionStatus />
            <div style={{ marginLeft: token.marginXS }} />
            <div style={{ display: 'flex' }}>
              <DeviceSelect />
              {showConnectBtn ? <ConnectButton /> : null}
            </div>
            <div style={{ marginLeft: token.marginXS }} />
          </>
        )}
        <div style={{ marginLeft: token.marginXS }} />
        <div id={HEADER_CONTENT_ID} />
      </div>
    </div>
  );
};

export { HeaderWrapper };

const Header = (props: any) => {
  const { children } = props;
  if (!headerContentDiv) {
    headerContentDiv = document.getElementById(HEADER_CONTENT_ID);
  }
  return headerContentDiv && ReactDOM.createPortal(<>{children}</>, headerContentDiv);
};

export default Header;
