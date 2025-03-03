// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { IGroupDevice } from '@/types/device';
import { DeleteOutlined, EditOutlined, MobileOutlined, WarningOutlined } from '@ant-design/icons';
import { Checkbox, message, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconPlatform from '../IconPlatform/IconPlatform';

// Item in the device list
const DeviceItem = (props: {
  device: IGroupDevice;
  type?: number;
  onDeleteOk: () => void;
  onSelect: (value: boolean) => void;
}) => {
  const { device, type, onDeleteOk, onSelect } = props;
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation();

  const handleDelete = () => {
    message.success(t('unbind_success')!);
    onDeleteOk?.();
  };

  const handleSelect = (event: any) => {
    setChecked(event.target.checked);
    onSelect?.(event.target.checked);
  };

  useEffect(() => {
    if (checked) {
      onSelect?.(true);
    }
  }, []);

  return (
    <div className="xdb-device-group-item">
      {device.top && (
        <div className="device-app">
          <IconPlatform osType={device.info.osType} className="icon" />
          {device.info.App}
        </div>
      )}
      <div className="xdb-device-item">
        {type === 1 && <Checkbox checked={checked} onChange={handleSelect} />}
        <MobileOutlined className="icon-phone" style={{ fontSize: 24 }} />
        <div className="item-content">
          <div className="item-top">
            <div className="item-device-name">{device.info.deviceModel}</div>
            <Popconfirm
              title={
                <>
                  {t('confirm_unbind_device')}
                  <br />
                  {t('irreversible_operation')}
                </>
              }
              onConfirm={handleDelete}
              icon={<WarningOutlined style={{ color: 'var(--ant-color-error)' }} />}
              okButtonProps={{ danger: true }}
            >
              <DeleteOutlined className="btn-delete" />
            </Popconfirm>
          </div>
          <div className="item-device-content">
            <span className="item-device-id">{device.info.did}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceItem;
