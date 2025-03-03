// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import useServer from '@/store/server';
import { IDevice, IGroupDevice } from '@/types/device';
import { getStore } from '@/utils/flooks';
import xdbDriver from '@/utils/xdbDriver';
import { MobileOutlined, PlusOutlined, QrcodeOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Divider, Menu } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeviceModal from '../DeviceModal/DeviceModal';
import './DeviceSelect.scss';
import IconPlatform from '../IconPlatform/IconPlatform';
import { getAppProcess } from '@/utils';
import debugDriver from '@/utils/debugDriver';
import { sendStatisticsEvent } from '@/utils/statisticsUtils';
import useUser from '@/store/user';
import envLogger from '@/utils/envLogger';
import { EventType, reportTimeSinceLastOp } from '@/utils/report';
import { isSameDevice } from '@/utils/devicesDriver';

const loopConnTs: number[] = [];
const connectionTimes = new Map<number, number>();

// eslint-disable-next-line max-lines-per-function
const DeviceSelect = () => {
  const { deviceList, selectedDevice, setSelectedDevice } = useConnection();
  const { schemaUrl } = getStore(useServer);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState<IGroupDevice[]>([]);

  const { t } = useTranslation();

  const { user } = useUser();

  function isUseOldUSBPlugin(device: IDevice | null): string {
    let isOldUSBPlugin = 'unknown';
    if (device === null) {
      return isOldUSBPlugin;
    }
    if (window.location.hostname.indexOf('localhost') === -1) {
      if (device.info?.network === 'USB') {
        isOldUSBPlugin = 'yes';
      }
    } else {
      isOldUSBPlugin = 'no';
    }
    return isOldUSBPlugin;
  }

  const reportLoopConn = useCallback(
    (newOnlineDevices: IGroupDevice[], oldOnlineDevices: IGroupDevice[]) => {
      // if the length of onlineDevices is decrease 3 times in 10 seconds, then report it as a loop connection
      if (newOnlineDevices.length < oldOnlineDevices.length) {
        loopConnTs.push(Date.now());
        if (loopConnTs.length > 3) {
          loopConnTs.shift();
        }
        if (loopConnTs.length === 3 && loopConnTs[2] - loopConnTs[0] < 10000) {
          envLogger.error(newOnlineDevices, {
            module: 'LDT',
            tag: 'ldt_devtool_loop_connection'
          });
          sendStatisticsEvent({
            name: 'ldt_devtool_loop_connection',
            categories: {
              connectionTye: selectedDevice?.info?.network ?? 'unknown',
              isOldUSBPlugin: isUseOldUSBPlugin(selectedDevice),
              hostname: window.location.hostname
            }
          });
        }
      }
    },
    [user]
  );

  const reportConnectionTime = useCallback((newOnlineDevices: IGroupDevice[], oldOnlineDevices: IGroupDevice[]) => {
    const newIds = new Set<number>();
    newOnlineDevices.forEach((device) => {
      const clientId = device.clientId as number;
      newIds.add(clientId);
      if (!connectionTimes.has(clientId)) {
        connectionTimes.set(clientId, Date.now());
      }
    });
    oldOnlineDevices.forEach((device) => {
      const clientId = device.clientId as number;
      if (!newIds.has(clientId)) {
        sendStatisticsEvent({
          name: 'devtool_device_connection_time',
          categories: {
            appId: device.info?.appId ?? device.info?.App,
            did: device.info?.did ?? '',
            osType: device.info?.osType ?? 'unknown'
          },
          metrics: {
            connectionTime: Date.now() - (connectionTimes.get(clientId) || 0)
          }
        });
        connectionTimes.delete(clientId);
      }
    });
  }, []);

  const reportOldUSBPlugin = useCallback(
    (newOnlineDevices: IGroupDevice[]) => {
      newOnlineDevices.forEach((device) => {
        if (isUseOldUSBPlugin(device) === 'yes') {
          sendStatisticsEvent({
            name: 'old_usb_plugin_new_device',
            categories: {
              connectionTye: device.info?.network ?? 'unknown',
              hostname: window.location.hostname
            }
          });
        }
      });
    },
    [user]
  );

  const reportTimeSinceLastOpForDisconnect = useCallback(
    (newOnlineDevices: IGroupDevice[], oldOnlineDevices: IGroupDevice[]) => {
      if (newOnlineDevices.length < oldOnlineDevices.length) {
        reportTimeSinceLastOp(EventType.Disconnect);
      }
    },
    [user]
  );

  useEffect(() => {
    const newOnlineDevices = xdbDriver.groupDevices(
      deviceList.filter((device) => device.clientId),
      'deviceModel'
    );
    sendStatisticsEvent({
      name: 'ldt_device_change',
      categories: {
        connectionTye: selectedDevice?.info?.network ?? 'unknown',
        isOldUSBPlugin: isUseOldUSBPlugin(selectedDevice),
        hostname: window.location.hostname
      }
    });
    reportLoopConn(newOnlineDevices, onlineDevices);
    reportConnectionTime(newOnlineDevices, onlineDevices);
    setOnlineDevices(newOnlineDevices);
    reportOldUSBPlugin(newOnlineDevices);
    reportTimeSinceLastOpForDisconnect(newOnlineDevices, onlineDevices);
  }, [deviceList]);

  const handleSelectDeviceClick = (device: IDevice) => {
    sendStatisticsEvent({
      name: 'ldt_feature_usage',
      categories: {
        feature: 'device_management',
        usage: 'switch_device'
      }
    });
    setSelectedDevice(device);
  };

  const xdbDevices = useMemo(() => {
    return deviceList.filter(
      (device) =>
        debugDriver.isMainProcess(device)
    );
  }, [deviceList]);

  const menu = (
    <Menu>
      {onlineDevices.map((device, index: number) => (
        <div key={index}>
          {device.top && index !== 0 && <Divider style={{ margin: '4px 0' }} />}
          {device.top && (
            <Menu.ItemGroup title={device.info.deviceModel} />
          )}
          <Menu.Item
            key={`${device.clientId}-${index}`}
            onClick={() => handleSelectDeviceClick(device)}
            style={{
              width: 200,
              backgroundColor: isSameDevice(device, selectedDevice) ? 'var(--ant-color-primary-1)' : 'transparent'
            }}
          >
            {device.info.App}
            {getAppProcess(device)}
          </Menu.Item>
        </div>
      ))}
    </Menu>
  );

  return (
    <div className="device-select">
      <Dropdown 
        overlay={menu} 
        trigger={['hover']}
        visible={dropdownVisible}
        disabled={!xdbDriver.isRealOnline(selectedDevice)}
        onVisibleChange={setDropdownVisible}
      >
        <div className="device-name-content" onClick={() => setDropdownVisible(xdbDriver.isRealOnline(selectedDevice) as boolean)}>
          {!xdbDriver.isRealOnline(selectedDevice) ? (
            <>
              <MobileOutlined className="device-type" />
              <span className="device-name">{t('connect_device_first')}</span>
            </>
          ) : (
            <>
              <IconPlatform
                osType={selectedDevice.info?.osType}
                className={`device-type${selectedDevice.clientId ? '' : ' disable'}`}
              />
              <span
                className={`device-name${selectedDevice.clientId ? '' : ' disable'}`}
              >{`${selectedDevice.info.deviceModel}(${selectedDevice.info.App})`}</span>
            </>
          )}
        </div>
      </Dropdown>

      <DeviceModal
        visible={deviceModalVisible}
        type={0}
        qrCode={schemaUrl}
        onCancel={() => setDeviceModalVisible(false)}
      />
    </div>
  );
};

export default DeviceSelect;
