// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

const Page404 = () => {
  const { t } = useTranslation();
  
  return (
    <Empty
      style={{ marginTop: '15%' }}
      image={Empty.PRESENTED_IMAGE_DEFAULT}
      description={
        <div>
          <h3>404 Not Found</h3>
          <p>{t('page_not_found')}</p>
        </div>
      }
    />
  );
};

export default Page404;
