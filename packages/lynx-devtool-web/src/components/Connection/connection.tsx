// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import useServer from '@/store/server';
import { EConnectionState } from '@/types/connection';
import { isOfflineMode } from '@/utils/const';
import { Switch, Tag } from 'antd';
import './connection.scss';
import { Phone } from './phone';
import { SchemaPrefixSelector } from './prefix';
import { useTranslation } from 'react-i18next';

export function Connection() {
  const { connectionState } = useConnection();
  const { useVpnIp, setUseVpnIp } = useServer();
  const { t } = useTranslation();

  const EConnectionState2Display: Record<string, React.ReactElement> = {
    [EConnectionState.Connected]: <Tag color="success">{t('connected')}</Tag>,
    [EConnectionState.Unconnected]: <Tag color="error">{t('disconnected')}</Tag>,
    [EConnectionState.Unstable]: <Tag color="warning">{t('unstable')}</Tag>,
    [EConnectionState.Connecting]: <Tag color="warning">{t('connecting')}</Tag>
  };

  return (
    <div className="panel-connection-container">
      <strong>{t('switch_server_notice')}</strong>
      <div className={'panel-connection-item'}>
        <span className={'left-panel-title'}>{t('server')}</span>
      </div>
      <div className={'panel-connection-item'}>
        <span className={'left-panel-title'}>{t('status')}</span> {EConnectionState2Display[connectionState]}
      </div>
      {isOfflineMode() && (
        <div className={'panel-connection-item'}>
          <span className={'left-panel-title'}>Use Seal IP</span>
          <Switch size="small" checked={useVpnIp} onChange={setUseVpnIp} />
        </div>
      )}
      <div className={'panel-connection-item'} style={{ marginTop: 5 }}>
        <SchemaPrefixSelector />
      </div>
      <div className={'panel-qr-item'}>
        <Phone />
      </div>
    </div>
  );
}
