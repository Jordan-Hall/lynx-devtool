// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useUnattached from '@/store/unattached';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const UnattachedDialog = (props: any) => {
  const { isDisplay, reconnect } = useUnattached();
  const { t } = useTranslation();
  const handleOk = () => {
    reconnect();
  };

  return (
    <Modal
      centered
      width={400}
      title={t('unattached_dialog_tip')}
      open={isDisplay}
      okText={t('unattached_dialog_ok') ?? 'Yes'}
      cancelText={t('unattached_dialog_no') ?? 'No'}
      onOk={handleOk}
      closable={false}
      maskClosable={false}
      cancelButtonProps={{ style: { display: 'none' } }}
    />
  );
};

export default UnattachedDialog;
