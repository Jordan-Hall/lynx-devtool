// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import { EConnectionState } from '@/types/connection';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ConnectionStatus.scss';
import { isInElectron } from '@/utils/const';
import { Modal } from 'antd';
import { restartLDTPlatformInElectron } from '@/api/electron';
import { sendStatisticsEvent } from '@/utils/statisticsUtils';

const ConnectionStatus = () => {
  const { connectionState, selectedDevice, delay } = useConnection();
  const { t } = useTranslation();
  const [reconnectCount, setReconnectCount] = useState(0);
  const [restartTipsModal, setRestartTipsModal] = useState<ReturnType<typeof Modal.error> | null>(null);
  const delayClassName = useMemo(() => {
    if (connectionState === EConnectionState.Connected) {
      if (selectedDevice.clientId) {
        if (delay < 100) {
          return 'primary';
        }
        if (delay < 300) {
          return 'warning';
        }
      } else {
        return 'warning';
      }
    }
    return 'danger';
  }, [connectionState, selectedDevice.clientId, delay]);

  useEffect(() => {
    if (!isInElectron()) {
      return;
    }

    if (connectionState === EConnectionState.Connected) {
      setReconnectCount(1);
      if (restartTipsModal) {
        restartTipsModal.destroy();
        setRestartTipsModal(null);
      }
      return;
    }

    if (connectionState !== EConnectionState.Connecting) {
      return;
    }

    if (!restartTipsModal && reconnectCount > 2) {
      const modal = Modal.error({
        centered: true,
        width: 'fit-content',
        content: (
          <p style={{ fontSize: 16, margin: 0, textAlign: 'center', fontWeight: 'bold' }}>
            The local debugging service cannot be connected, please check if the terminal service is still running!
          </p>
        ),
        cancelText: 'The terminal service is running, continue to try to connect',
        cancelButtonProps: {
          type: 'primary',
          ghost: true
        },
        onCancel: () => {
          modal.destroy();
          setRestartTipsModal(null);
          sendStatisticsEvent({
            name: 'ldt_restart_tips_modal',
            categories: {
              eventType: 'continue_reconnect'
            }
          });
        },
        okText: 'The terminal service has been terminated, but I want to continue using LDT',
        okButtonProps: {
          type: 'primary'
        },
        onOk: () => {
          modal.destroy();
          setRestartTipsModal(null);
          sendStatisticsEvent({
            name: 'ldt_restart_tips_modal',
            categories: {
              eventType: 'restart'
            }
          });
          restartLDTPlatformInElectron();
        },
        closable: false,
        maskClosable: false
      });
      sendStatisticsEvent({
        name: 'ldt_restart_tips_modal',
        categories: {
          eventType: 'show'
        }
      });
      setRestartTipsModal(modal);
      setReconnectCount(1);
      return;
    }

    setReconnectCount((prev) => prev + 1);
  }, [connectionState]);

  const buildStatusView = () => {
    if (connectionState === EConnectionState.Connected) {
      if (selectedDevice.clientId) {
        return (
          <>
            <b className="network-content">{selectedDevice.info?.network || 'WiFi'}</b>
            <div style={{ width: 1, height: 15, backgroundColor: '#cccccc', marginLeft: 5 }} />
            <span className="delay-content">{`${delay === -1 ? '--' : delay}ms`}</span>
          </>
        );
      } else {
        return <span className="delay-content">{t('no_device')}</span>;
      }
    } else if (connectionState === EConnectionState.Unconnected) {
      return <span className="delay-content">{t('disconnected')}</span>;
    } else if (connectionState === EConnectionState.Connecting) {
      return <span className="delay-content">{t('connecting')}</span>;
    }
    return null;
  };

  return <div className={`connection-status ${delayClassName}`}>{buildStatusView()}</div>;
};

export default ConnectionStatus;
