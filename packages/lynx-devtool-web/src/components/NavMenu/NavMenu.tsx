// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { getLDTVersion } from '@/api/api';
import { isInElectron, isOfflineMode } from '@/utils/const';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRouters } from '../../router';
import { RouterConfig } from '../CacheRoutes/CacheRoutes';
import './NavMenu.scss';

const convertRouters = (arr?: Array<RouterConfig>, parent?: RouterConfig): MenuProps['items'] =>
  arr
    ?.filter((router) => (!router.isValid || router.isValid()) && router.isMenu)
    ?.map((router) => ({
      key: parent ? `${parent.path}${router.path}` : router.path,
      label: router.title,
      icon: router.icon,
      children: convertRouters(router.children, router)
    }));

const NavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [version, setVersion] = useState<string>();
  const [collapsed, setCollapsed] = useState(isInElectron());
  const { t } = useTranslation();

  const menuItems = useMemo(() => {
    return convertRouters(getRouters());
  }, [t]);

  const defaultOpenKeys = useMemo(() => {
    return menuItems?.map((router: any) => router.key);
  }, [menuItems]);

  const go = (pathname: string) => {
    navigate({ pathname });
  };

  const onSelect: MenuProps['onSelect'] = ({ key }) => {
    go(key);
  };

  const toHome = () => {
    go('/devtool');
  };

  useEffect(() => {
    if (isOfflineMode()) {
      getLDTVersion().then((resp) => {
        const { code, data } = resp.data;
        if (code === 0) {
          setVersion(data);
        }
      });
    }
  }, []);

  return (
    <div className={`xdb-nav-menu${collapsed ? ' collapsed' : ''}`}>
      <div className="nav-header" onClick={toHome}>
        {!collapsed && (
          <div className="nav-title">
            <div>Lynx DevTool</div>
            {version && (
              <span className="version" title={version}>
                v{version}
              </span>
            )}
          </div>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        onSelect={onSelect}
        inlineCollapsed={collapsed}
      />
      <div className="nav-footer">
        <div 
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '>' : '<'}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
