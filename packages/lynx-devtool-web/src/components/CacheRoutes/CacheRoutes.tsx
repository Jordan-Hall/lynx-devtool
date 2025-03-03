// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { getLDTVersion } from '@/api/api';
import useServer from '@/store/server';
import { isOfflineMode } from '@/utils/const';
import { queryService } from '@/utils/query';
import {
  createRoutesFromChildren,
  Navigate,
  Outlet,
  Route,
  RouteObject,
  RoutesProps,
  useLocation,
  useRoutes
} from '@modern-js/runtime/router';
import { lazy, useMemo, useRef } from 'react';
import { Freeze } from 'react-freeze';
const Page404 = lazy(() => import('../../containers/404/404'));
const NotSupport = lazy(() => import('../NotSupport/NotSupport'));

const cachePaths = new Set<string>();
const titleMap = new Map<string, RouterConfig>();

let version: null | string = null;

export interface RouterConfig {
  title: string;
  path: string;
  redirect?: string;
  children?: Array<RouterConfig>;
  keepAlive?: boolean;
  icon?: React.ReactNode;
  element?: React.ReactNode;
  isMenu?: boolean | (() => boolean);
  isValid?: () => boolean;
  isNotSupport?: () => boolean;
  needLogin?: boolean;
}

interface CacheRoutesProps extends RoutesProps {
  routes: RouterConfig[];
  location?: Partial<Location> | string;
}

function useCreateCache(element: React.ReactElement | null): React.ReactElement {
  const cacheRef = useRef<Record<string, React.ReactElement | null>>({});

  const { pathname } = useLocation();
  const { roomId, webSocketHost, isCustomWS } = useServer();

  const needCache = cachePaths.has(pathname);
  const route = titleMap.get(pathname);

  let showElement = element;
  if (route?.isNotSupport && route?.isNotSupport()) {
    showElement = <NotSupport />;
  }
  if (needCache && !Object.prototype.hasOwnProperty.call(cacheRef.current, pathname)) {
    cacheRef.current[pathname] = showElement;
  }
  getLDTVersion().then((resp) => {
    const { code, data } = resp.data;
    if (code === 0) {
      version = data;
    }
    document.title = `${route?.title ?? 'Lynx DevTool'} (v${version ?? 'Unknown'})`;
  });

  
  
  document.body.style.overscrollBehaviorX =
    pathname.endsWith('/trace') || pathname.endsWith('/lighthouse') ? 'none' : 'auto';
  if (isCustomWS) {
    queryService.setWSUrl(webSocketHost);
  }
  queryService.setRoomId(roomId);

  return (
    <>
      {Object.entries(cacheRef.current).map(([key, el]) => {
        const isMatch = key === pathname;
        return (
          <Freeze key={key} freeze={!isMatch}>
            {el}
          </Freeze>
        );
      })}
      {!needCache && showElement}
    </>
  );
}

function useCacheRoutes(routes: RouteObject[], locationArg?: Partial<Location> | string): React.ReactElement {
  const currentOutlet = useRoutes(routes, locationArg);
  return useCreateCache(currentOutlet);
}

const getRouters = (arr?: Array<RouterConfig>, parent?: RouterConfig) => {
  return arr
    ?.filter((route) => !route.isValid || route.isValid())
    ?.map((route) => {
      const { path, element, redirect, keepAlive, children } = route;
      const absPath = parent ? `${parent.path}${path}` : path;
      titleMap.set(absPath, route);
      let component = element;
      if (!element) {
        if (redirect) {
          component = <Navigate to={`${path}${redirect}`} />;
        } else if (children) {
          component = <Outlet />;
        } else {
          component = <Page404 />;
        }
      }

      if (keepAlive) {
        cachePaths.add(absPath);
      }
      return (
        <Route key={absPath} path={absPath} element={component}>
          {getRouters(children, route)}
        </Route>
      );
    });
};

export default function CacheRoutes({ routes, location }: CacheRoutesProps): React.ReactElement {
  const children = useMemo(() => {
    return createRoutesFromChildren(getRouters(routes));
  }, [routes]);
  return useCacheRoutes(children, location);
}
