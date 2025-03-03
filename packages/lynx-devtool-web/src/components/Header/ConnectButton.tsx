// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import { EConnectionState } from '@/types/connection';
import { sendStatisticsEvent } from '@/utils/statisticsUtils';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const ConnectButton = () => {
  const { selectedDevice, connectionState, connectRemoteDevice } = useConnection();
  const { loading } = connectRemoteDevice as any;
  const { t } = useTranslation();

  const handleConnect = useCallback(() => {
    const startTime = Date.now();
    sendStatisticsEvent({
      name: 'devtool_connect_button_clicked'
    });
    connectRemoteDevice(true)
      .then(() => {
        sendStatisticsEvent({
          name: 'devtool_connect_button_success',
          metrics: {
            connectionTime: Date.now() - startTime
          }
        });
      })
      .catch((e) => {
        message.error(t('connect_timeout_tips'));
        sendStatisticsEvent({
          name: 'devtool_connect_button_failure',
          metrics: {
            failureTime: Date.now() - startTime
          }
        });
      });
  }, [t]);

  return selectedDevice.xdbOnline && !selectedDevice.clientId && connectionState === EConnectionState.Connected ? (
    <Button
      loading={loading}
      aria-label={t('connect') || ''}
      onClick={handleConnect}
      icon={<PlayCircleOutlined />}
      title={t('connect_button_desc') || ''}
    />
  ) : null;
};

export default ConnectButton;
