// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Button, Space, message } from 'antd';
import copy from 'copy-text-to-clipboard';
import QRCode from 'qrcode.react';
import './phone.css';
import useServer from '@/store/server';
import { useTranslation } from 'react-i18next';

export const Phone = () => {
  const { schemaUrl: url } = useServer();
  const { t } = useTranslation();

  const handleCopy = (type: number) => {
    if (type === 0) {
      copy(`xcrun simctl openurl booted "${url}"`);
      message.success('copyed xcrun command');
    } else if (type === 1) {
      copy(`adb shell am start -W -a android.intent.action.VIEW -d "${url.replace('&', '\\&')}"`);
      message.success('copyed adb command');
    } else if (type === 2) {
      copy(url);
      message.success('copied connection schema');
    }
  };

  return (
    <div className={'connection-container'}>
      <QRCode className="qr-container" value={url} level="L" renderAs="svg" />
      <Space className="connection-button-group">
        <Button type="text" onClick={() => handleCopy(0)}>
          {t('ios_simulator')}
        </Button>
        <Button id="android-copy-btn" type="text" onClick={() => handleCopy(1)}>
          ADB
        </Button>
        <Button id="pc-copy-btn" type="text" onClick={() => handleCopy(2)}>
          PC
        </Button>
      </Space>
    </div>
  );
};
