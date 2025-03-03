// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { EConnectionPrefix } from '@/types/connection';
import debugDriver from '@/utils/debugDriver';
import { queryService } from '@/utils/query';
import create from '../utils/flooks';

export type ServerStoreType = ReturnType<typeof serverStore>;

export const KEY_USE_VPN_IP = 'useVpnIp';

const serverStore = (store: any) => ({
  roomId: queryService.getRoomId(),
  webSocketHost: queryService.getWSUrlInQuery(),
  prefix: EConnectionPrefix.lynx,
  schemaUrl: '',
  useVpnIp: localStorage.getItem(KEY_USE_VPN_IP) === 'true',
  isCustomWS: Boolean(queryService.getWSUrlInQuery()),

  updateWebSocketHost(host: string) {
    store({ webSocketHost: host });
  },
  async updateSchemaPrefix(prefix: string) {
    store({ prefix });
    const schemaUrl = await debugDriver.getRemoteSchema(prefix);
    store({ schemaUrl });
  },
  async setUseVpnIp(useVpnIp: boolean) {
    store({ useVpnIp });
    localStorage.setItem(KEY_USE_VPN_IP, String(useVpnIp));
    const { prefix } = store();
    const schemaUrl = await debugDriver.getRemoteSchema(prefix);
    store({ schemaUrl });
  }
});

const useServer = create(serverStore);
export default useServer;
