// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useServer from '@/store/server';
import { Select } from 'antd';
import { queryService } from '../../utils/query';

export function ServerSelector() {
  const { updateWebSocketHost, webSocketHost } = useServer();
  const wsInQuery = queryService.getWSUrlInQuery();
  return (
    <Select
      defaultValue={'CUSTOM'}
      value={'CUSTOM'}
      onChange={(v) => {
        updateWebSocketHost(v as string);
      }}
      size="small"
      disabled={Boolean(wsInQuery)}
      dropdownStyle={{ zIndex: 1500 }}
    >
    </Select>
  );
}
