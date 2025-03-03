// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import { PictureOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import './PageSelect.scss';
import PageSession from './page';
import { isInMobilePageMode } from '@/utils/const';

const PageSelect = () => {
  const { deviceInfoMap, selectedDevice, cardFilter } = useConnection();
  const { t } = useTranslation();
  const getDeviceText = () => {
    const { sessions, selectedSession } = deviceInfoMap[selectedDevice.clientId ?? 0] || {};
    if (!sessions || sessions.length === 0) {
      return t('please_open_the_card');
    }
    if (!selectedSession) {
      if (cardFilter) {
        return t('no_filter_select_card');
      }
      return t('please_select_the_card');
    }
    return selectedSession.url;
  };

  if (selectedDevice.clientId && isInMobilePageMode()) {
    const deviceInfo = deviceInfoMap[selectedDevice.clientId];
    if (deviceInfo) {
      return (
        <Dropdown 
          destroyPopupOnHide={true}
          trigger={['hover']}
          overlayStyle={{ width: 300 }}
          dropdownRender={() => <Menu><PageSession /></Menu>}
        >
          <div className={`devtool-button ${deviceInfo.isCardDebugMode ? 'warning' : 'primary'}`}>
            <span className="devtool-button-left">
              <PictureOutlined />
              <span
                style={{
                  marginLeft: 5,
                  maxWidth: 200,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {getDeviceText()}
              </span>
            </span>
            <DownOutlined />
          </div>
        </Dropdown>
      );
    }
  }

  return null;
};

export default PageSelect;
