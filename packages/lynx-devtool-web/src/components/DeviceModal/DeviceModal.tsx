// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { IDevice, IGroupDevice } from '@/types/device';
import xdbDriver from '@/utils/xdbDriver';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from '../Connection/phone';
import { SchemaPrefixSelector } from '../Connection/prefix';
import QRImage from '../QRImage/QRImage';
import DeviceItem from './DeviceItem';
import './DeviceModal.scss';
import useConnection from '@/store/connection';
import { sendStatisticsEvent } from '@/utils/statisticsUtils';

interface DeviceModalProps extends Omit<ModalProps, 'onOk'> {
  type: 0 | 1;
  qrCode?: string;
  onConfirm?: (devices: IDevice[]) => void;
}

const DeviceModal = (props: DeviceModalProps) => {
  const { visible, type, qrCode, onConfirm, ...restProps } = props;
  const { deviceList } = useConnection();
  const [groupDeviceList, setGroupDeviceList] = useState<IGroupDevice[]>([]);
  const [deviceEditModalVisible, setDeviceEditModalVisible] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<IDevice[]>([]);
  const { t } = useTranslation();

  const loadDevices = () => {
    setGroupDeviceList(xdbDriver.groupDevices(xdbDriver.bindDevices));
  };

  useEffect(() => {
    if (visible) {
      loadDevices();
    } else {
      setSelectedDevices([]);
    }
  }, [visible, deviceList]);

  useEffect(() => {
    if (!visible || type !== 0) {
      return;
    }
    sendStatisticsEvent({
      name: 'ldt_feature_usage',
      categories: {
        feature: 'device_management',
        usage: 'view_device_modal'
      }
    });
  }, [visible, type]);

  const handleDeleteOk = () => {
    loadDevices();
    sendStatisticsEvent({
      name: 'ldt_feature_usage',
      categories: {
        feature: 'device_management',
        usage: 'delete_device'
      }
    });
  };

  const handleSelectDevice = (device: IDevice, selected: boolean) => {
    if (selected) {
      selectedDevices.push(device);
    } else {
      selectedDevices.splice(selectedDevices.indexOf(device), 1);
    }
    setSelectedDevices([...selectedDevices]);
  };

  const handleOk = () => {
    onConfirm?.([...selectedDevices]);
  };

  const modalProps = {
    ...restProps,
    title: type === 0 ? t('device_management') : t('fetch_data'),
    footer: type === 0 ? null : undefined,
    width: 720,
    onOk: handleOk,
    keyboard: true,
    visible
  };

  return (
    <Modal {...modalProps}>
      <div className="xdb-modal-id">
        <div className="data-list">
          {groupDeviceList.map((device) => (
            <div key={`${device.clientId}-${device.info?.appId}-${device.info?.did}`}>
              <DeviceItem
                device={device}
                type={type}
                onDeleteOk={handleDeleteOk}
                onSelect={(value) => handleSelectDevice(device, value)}
              />
            </div>
          ))}
        </div>
        <div className="input-right-id">
          {type === 0 ? (
            <>
              <SchemaPrefixSelector />
              <Phone />
              <div style={{ marginTop: 15 }}>{t('scan_qr_to_bind_device')}</div>
              <Button 
                icon={<PlusOutlined />} 
                style={{ marginTop: 15 }} 
                onClick={() => setDeviceEditModalVisible(true)}
              >
                {t('add_manully')}
              </Button>
            </>
          ) : (
            <>
              <QRImage sourceUrl={qrCode} size={180} />
              <div style={{ marginTop: 15 }}>{t('scan_qr_to_fetch_data')}</div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeviceModal;
