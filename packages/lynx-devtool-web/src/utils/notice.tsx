// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { notification, message } from 'antd';
import { t } from 'i18next';
import { sendStatisticsEvent } from './statisticsUtils';
import * as reduxUtils from './storeUtils';

export function showLinkNotice(title: string, msg: string, href: string) {
  notification.warning({
    message: title,
    description: (
      <>
        <div>{msg}</div>
        <a target="_blank" rel="noreferrer" href={href}>
          {title}
        </a>
      </>
    ),
    duration: 6
  });
}

export function showNotImplementedError(type: string) {
  sendStatisticsEvent({
    name: 'ldt_feature_usage',
    categories: {
      feature: 'not_implemented_error',
      usage: type
    }
  });
  const currentClient = reduxUtils.getSelectClient();
  const deviceModel = currentClient?.info?.deviceModel;
  if (deviceModel?.indexOf('iPhone') >= 0) {
    const msg = `Current app does not have ${type} function, please check your app`;
    const title = 'The iOS app does not support this function';
    showLinkNotice(title, msg, '');
    return;
  }
  message.error('Please restart app to enable debug mode');
}

export function showAdbError() {
  const msg = `The adb service is abnormal, please check the adb service status`;
  const title = 'ADB service abnormal';
  showLinkNotice(title, msg, '');
}

export function showTimeoutError() {
  message.error('Timeout! Please make sure the App is in the foreground and try again ');
}

export function showServerError() {
  message.error('Failed to start the server, please restart it manually');
}

export function showExistServerError() {
  notification.error({
    message: t('multiple_app_tips'),
    duration: 6,
    placement: 'top'
  });
}
