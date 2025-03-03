// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const SCHEME = 'xdb';

export function getEnvConfigSchema(id: string): string {
  return `${SCHEME}://xdb_get_env_config?id=${id}`;
}

export function getProxyConfigSchema(id: string): string {
  const mapId = sessionStorage.getItem('map_id');
  return `${SCHEME}://xdb_get_proxy_config?id=${id}${mapId ? `&mapId=${mapId}` : ''}`;
}

export function getAppConfigGroupSchema(id: string): string {
  return `${SCHEME}://xdb_get_app_config_group?id=${id}`;
}
