// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useConnection from '@/store/connection';
import { IDeviceInfo, ISessionInfo } from '@/types/device';
import LDT_CONST from '@/utils/const';
import { queryService } from '@/utils/query';
import { sendStatisticsEvent } from '@/utils/statisticsUtils';
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Badge, Col, Input, Row, Switch, message, Tooltip } from 'antd';
import { useLocation } from '@modern-js/runtime/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-text-to-clipboard';
import './page.scss';

const tableHeight = document.body.clientHeight - 500;

// eslint-disable-next-line max-lines-per-function
const PageSession = () => {
  const {
    deviceInfoMap,
    selectedDevice: device,
    setSelectedSession,
    setStopAtEntry,
    setStopLepusAtEntry,
    multiCardMode,
    setMultiCardMode,
    keepCardOpen,
    setKeepCardOpen,
    cardFilter,
    setCardFilter
  } = useConnection();
  const [autoFocus, setAutoFocus] = useState(localStorage.getItem(LDT_CONST.KEY_AUTO_FOCUS_LAST_SESSION) !== 'false');
  const location = useLocation();
  const { t } = useTranslation();

  const isDevToolPage = location.pathname === '/devtool';

  if (!device) {
    return null;
  }
  const deviceItem: IDeviceInfo = deviceInfoMap[device.clientId ?? 0];
  if (!deviceItem) {
    return null;
  }

  const { info } = device;
  const handleFocusChange = (value: boolean) => {
    localStorage.setItem(LDT_CONST.KEY_AUTO_FOCUS_LAST_SESSION, `${value}`);
    setAutoFocus(value);
    if (value && deviceItem.sessions && deviceItem.sessions.length > 0) {
      setSelectedSession(deviceItem.sessions[0].session_id);
    }
  };

  const handleSelectCard = (session: ISessionInfo) => {
    if (!session.url.includes(cardFilter)) {
      return;
    }
    setKeepCardOpen(false);
    setSelectedSession(session.session_id);
    sendStatisticsEvent({
      name: 'ldt_feature_usage',
      categories: {
        feature: 'session_management',
        usage: 'select_devtools_card'
      }
    });
  };

  // Fix: When inputting filter to filter cards, if a card switch occurs, the card selection page will be closed due to focus issues
  useEffect(() => {
    const input = document.getElementById('cardFilterInput');
    const focusInput = () => {
      setTimeout(() => {
        window.focus();
        input?.focus();
      }, 0);
    };
    window.addEventListener('blur', focusInput);
    return () => {
      window.removeEventListener('blur', focusInput);
    };
  }, []);

  // session screenshot preview
  const getPreview = (data: string | undefined): JSX.Element => {
    return <img src={`data:image/jpeg;base64, ${data}`} alt="session-preview" />;
  };

  const deviceInfoItemHeaderClassName = 'device-info-item' + ' ' + 'device-info-item-head';
  return (
    <div style={{ padding: 10 }}>
      <div className={deviceInfoItemHeaderClassName}>
        <span className={'left-panel-title'}>{t('info')}</span>
      </div>
      <div className={'device-info-item'}>
        <span className={'left-panel-title'}>{t('app_name')}</span>
        <span className={'left-panel-value'}>{info.App}</span>
      </div>
      <div className={'device-info-item'}>
        <span className={'left-panel-title'}>{t('app_version')}</span>
        <span className={'left-panel-value-ono'}>{info.AppVersion}</span>
      </div>
      <div className={'device-info-item'}>
        <span className={'left-panel-title'}>{t('os_version')}</span>
        <span className={'left-panel-value-ono'}>
          {info.osVersion}
          {info.osType === 'iOS' && info.osSupportWebDevtool === 'false' && (
            <strong> {t('os_not_support_webview_debug')}</strong>
          )}
        </span>
      </div>

      <div className={'device-info-item'}>
        <span className={'left-panel-title'}>{t('sdk_version')}</span>
        <span className={'left-panel-value-ono'}>{info.sdkVersion}</span>
      </div>

      {info.ldtVersion && (
        <div className={'device-info-item'}>
          <span className={'left-panel-title'}>{t('ldt_version')}</span>
          <span className={'left-panel-value-ono'}>{info.ldtVersion}</span>
        </div>
      )}

      <div className={deviceInfoItemHeaderClassName}>
        <span className={'left-panel-title'}>{t('settings')}</span>
      </div>
      <Row>
        <Col span={12}>
          <div className={'device-info-item'}>
            <span className={'left-panel-title'}>{t('stop_at_entry')}</span>
            <Switch
              className={'right-panel-input'}
              size="small"
              checked={deviceItem.stopAtEntry}
              onChange={setStopAtEntry}
            />
            <Tooltip
              title={
                <span style={{ color: 'white', wordBreak: 'break-word' }}>
                   {t('stop_at_entry_tooltip')}
                </span>
              }
              placement="rightTop"
            >
              <QuestionCircleOutlined className="icon-help-circle" style={{ marginLeft: 8 }} />
            </Tooltip>
          </div>
        </Col>
        <Col span={12}>
          <div className={'device-info-item'}>
            <span className={'left-panel-title'}>{t('stop_lepus_at_entry')}</span>
            <Switch
              className={'right-panel-input'}
              size="small"
              checked={deviceItem.stopLepusAtEntry}
              onChange={setStopLepusAtEntry}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div className={'device-info-item'}>
            <span className={'left-panel-title'}>
              <a>{t('focus_on_latest_card')}</a>
            </span>
            <Switch
              className={'right-panel-input'}
              size="small"
              checked={autoFocus}
              onChange={(checked) => {
                handleFocusChange(checked);
                checked && setKeepCardOpen(false);
              }}
            />
            <Tooltip
              title={
                <span style={{ color: 'white', wordBreak: 'break-word' }}>
                  {t('tips_for_focus_on_latest_card_on')}
                  <br />
                  {t('tips_for_focus_on_latest_card_off')}
                </span>
              }
              placement="rightTop"
            >
              <QuestionCircleOutlined className="icon-help-circle" style={{ marginLeft: 8 }} />
            </Tooltip>
          </div>
        </Col>
        <Col span={12}>
          <div className={'device-info-item'}>
            <span className={'left-panel-title'}>{t('multi_card_mode')}</span>
            <Switch
              className={'right-panel-input'}
              size="small"
              checked={multiCardMode}
              onChange={(checked) => {
                checked && setKeepCardOpen(false);
                setMultiCardMode(checked);
              }}
            />
          </div>
        </Col>
      </Row>
      {/* NOT available in multi-card mode  */}
      {!multiCardMode && (
        <Row>
          <Col span={12}>
            <div className="device-info-item">
              <span className="left-panel-title">{t('keep_card_open')}</span>
              <Switch
                className="right-panel-input"
                size="small"
                checked={keepCardOpen}
                onChange={(checked) => {
                  setKeepCardOpen(checked);
                  checked && handleFocusChange(false);
                }}
              />
              <Tooltip
                title={
                  <span style={{ color: 'white', wordBreak: 'break-word' }}>{t('tips_for_keep_card_open')}</span>
                }
                placement="rightTop"
              >
                <QuestionCircleOutlined className="icon-help-circle" style={{ marginLeft: 8 }} />
              </Tooltip>
            </div>
          </Col>
        </Row>
      )}

      <div className={deviceInfoItemHeaderClassName} style={{ marginTop: 10 }}>
        <span className="left-panel-title">{t('card_list')}</span>
        <Input
          id="cardFilterInput"
          className="right-panel-input"
          placeholder={t('keyword_filter')!}
          size="small"
          allowClear
          autoFocus
          value={cardFilter}
          onChange={(e) => {
            setCardFilter(e.target.value);
          }}
        />
      </div>
      {(!multiCardMode || !isDevToolPage) && (
        <div style={{ maxHeight: tableHeight, overflow: 'auto' }}>
          {!deviceItem.sessions || deviceItem.sessions?.length === 0 ? (
            <p style={{ color: 'rgb(142 142 142)', fontSize: '12px' }}>{t('no_cards_opened')}</p>
          ) : (
            deviceItem.sessions.map((session) => {
              const isSelected = deviceItem.selectedSession?.session_id === session.session_id;
              return (
                <div
                  key={`${device.clientId}-${session.session_id}`}
                  className={`page-session-section${
                    isSelected ? (deviceItem.isCardDebugMode ? ' page-session-debuged' : ' page-session-selected') : ''
                  }`}
                  onClick={() => handleSelectCard(session)}
                >
                  <Tooltip
                    title={
                      session.screenshot ? (
                        <div className="page-session-item-tooltips-content">
                          {getPreview(session.screenshot)}
                          <div className="page-session-item-url-container">
                            <CopyOutlined
                              className="copy-icon"
                              onClick={() => {
                                copy(session.url);
                                message.success('Copy Success');
                              }}
                            />
                            {session.url}
                          </div>
                        </div>
                      ) : (
                        <div className="page-session-item-url-container">
                          <CopyOutlined
                            className="copy-icon"
                            onClick={() => {
                              copy(session.url);
                              message.success('Copy Success');
                            }}
                          />
                          {session.url}
                        </div>
                      )
                    }
                    placement="rightTop"
                  >
                    <div
                      className={`page-session-item${
                        session.url.includes(cardFilter) ? '' : ' page-session-filtered-out'
                      }`}
                    >
                      <Badge
                        count={`${queryService.getDevStatus() ? `${session.session_id}-` : ''}${
                          session.type ? session.type : 'Lynx'
                        }`}
                        status={session.type === 'web' ? 'default' : session.type === 'worker' ? 'processing' : 'warning'}
                        style={{ marginRight: 20 }}
                      >
                        <span className={'page-session-item-content'}>{session.url}</span>
                      </Badge>
                    </div>
                  </Tooltip>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PageSession;
