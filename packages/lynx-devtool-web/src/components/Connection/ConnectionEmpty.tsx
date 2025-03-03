// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import useServer from '@/store/server';
import { EConnectionState } from '@/types/connection';
import { isInMobilePageMode, isOfflineMode } from '@/utils/const';
import { Button, Empty, Spin } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import ConnectButton from '../Header/ConnectButton';
import './ConnectionEmpty.scss';
import { Phone } from './phone';
import { SchemaPrefixSelector } from './prefix';

const ConnectionEmpty = () => {
  const { deviceInfoMap, selectedDevice, connectionState, openConnection } = useConnection();
  const { webSocketHost, roomId } = useServer();
  const { t } = useTranslation();

  const selectedSession = deviceInfoMap[selectedDevice.clientId ?? 0]?.selectedSession;
  const notice: any = {
    image: null,
  };

  const getDesc = () => {
    return isOfflineMode() ? t('connect_tips_via_usb') : t('scan_qr_to_connect_tips');
  };

  if (connectionState === EConnectionState.Unconnected) {
    notice.title = <Button onClick={() => openConnection(webSocketHost, roomId)}>{t('retry_connection')}</Button>;
    notice.desc = t('retry_connect_tips');
  } else if (connectionState === EConnectionState.Connecting) {
    notice.title = <Spin />;
    notice.desc = t('connecting');
  } else if (!selectedDevice.clientId) {
    if (isInMobilePageMode()) {
      notice.title = t('connect_device_first');
      const components = ([] as any[]).concat(<ConnectButton />);
      if (selectedDevice.xdbOnline) {
        notice.desc = (
          <>
            <Trans i18nKey="click_btn_or" components={components} />
            {getDesc()}
          </>
        );
      } else {
        notice.desc = getDesc();
      }
    } else {
      notice.title = 'Unable to connect to the simulator';
      notice.desc = '';
    }
  } else if (!selectedSession) {
    notice.title = t('please_open_the_card');
    notice.desc = t('please_open_lynx_or_web');
  }

  return (
    <Empty
      className="connection-empty"
      description={notice.desc}
    >
      {notice.title && <div>{notice.title}</div>}
    </Empty>
  );
};

export default ConnectionEmpty;
