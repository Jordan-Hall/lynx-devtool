// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import React, { useState } from 'react';
import { Button, Radio, message } from 'antd';
import { ESwitchType } from '@/types/connection';
import * as switchUtils from '@/utils/switchUtils';
import { useTranslation } from 'react-i18next';

const SwitchComponent = ({ devtoolSwitch, domTreeSwitch, close }: any) => {
  const [checkStatus, setCheckStatus] = useState<Record<string, boolean>>({
    enable_devtool: true,
    enable_dom_tree: true
  });
  const { t } = useTranslation();

  const handleRadioClick = (e: any) => {
    const { name, checked } = e.target;
    if (name === ESwitchType.enableDevtool) {
      setCheckStatus((s) => ({
        ...s,
        enable_devtool: checked
      }));
    } else {
      setCheckStatus((s) => ({
        ...s,
        enable_dom_tree: checked
      }));
    }
  };

  const handleConfirm = () => {
    !devtoolSwitch && switchUtils.openDevtool(checkStatus[ESwitchType.enableDevtool]);
    !domTreeSwitch && switchUtils.openDomTree(checkStatus[ESwitchType.enableDomTree]);
    message.success('Done! switches status changed!');
    close?.();
  };

  if (devtoolSwitch && domTreeSwitch) {
    return null;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!devtoolSwitch && (
          <Radio.Group 
            value={checkStatus[ESwitchType.enableDevtool]}
            onChange={(e) => handleRadioClick({ target: { name: ESwitchType.enableDevtool, checked: e.target.value }})}
          >
            <Radio value={true}>
              {t('lynx_devtool_switch')}
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                {t('lynx_devtool_switch_tips')}
              </div>
            </Radio>
          </Radio.Group>
        )}
        {!domTreeSwitch && (
          <Radio.Group 
            value={checkStatus[ESwitchType.enableDomTree]}
            onChange={(e) => handleRadioClick({ target: { name: ESwitchType.enableDomTree, checked: e.target.value }})}
          >
            <Radio value={true}>
              {t('dom_inspect_switch')}
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                {t('dom_inspect_switch_tips')}
              </div>
            </Radio>
          </Radio.Group>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <Button onClick={() => close?.()}>{t('cancel')}</Button>
        <Button type="primary" onClick={handleConfirm}>{t('confirm')}</Button>
      </div>
    </div>
  );
};

export default SwitchComponent;
