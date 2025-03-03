// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import React, { useCallback } from 'react';
import { Modal } from 'antd';
import QRCode from 'qrcode.react';

import './QRImage.scss';
import { useTranslation } from 'react-i18next';

const QRImage = (props: any) => {
  const { sourceUrl, size } = props;
  const { t } = useTranslation();
  const zoomIn = useCallback(() => {
    Modal.info({
      title: t('qr_code'),
      width: 370,
      content: (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <QRCode value={sourceUrl} size={320} />
        </div>
      )
    });
  }, [sourceUrl, t]);
  return (
    <div className="QrImage" onClick={zoomIn}>
      <QRCode value={sourceUrl} size={size} />
    </div>
  );
};

export default QRImage;
