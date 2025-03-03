// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Empty } from 'antd';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const NotSupport = () => {
  const { Text } = Typography;
  const { t } = useTranslation();

  return (
    <Empty
      style={{ marginTop: '15%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <Typography.Title level={5}>{t('support_in_offline')}</Typography.Title>
          <Typography.Text>{t('unsupported_function')}</Typography.Text>
        </>
      }
    />
  );
};

export default NotSupport;
