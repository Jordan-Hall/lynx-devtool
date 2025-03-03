// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import useServer from '@/store/server';
import { EConnectionPrefix } from '@/types/connection';
import { Input, Select, Space } from 'antd';

const options = [
  {
    value: EConnectionPrefix.lynx,
    label: 'lynx'
  },
  {
    value: 'custom',
    label: 'Custom'
  }
];

function isCustom(s: string) {
  return (
    (
      [
        EConnectionPrefix.lynx,
      ] as string[]
    ).indexOf(s) === -1
  );
}

export function SchemaPrefixSelector() {
  const { prefix, updateSchemaPrefix } = useServer();
  const isCustomPrefix = isCustom(prefix);
  const handleChange = (value: any) => {
    updateSchemaPrefix(value);
  };
  return (
    <Space.Compact style={{ width: 230 }}>
      <Select
        defaultValue={isCustomPrefix ? 'custom' : prefix}
        value={isCustomPrefix ? 'custom' : prefix}
        onChange={handleChange}
        style={{ width: '40%' }}
        dropdownStyle={{ zIndex: 1500 }}
      >
        {options.map((option) => (
          <Select.Option value={option.value} key={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
      <Input style={{ width: '60%' }} defaultValue={prefix} value={prefix} onChange={(e) => handleChange(e.target.value)} />
    </Space.Compact>
  );
}
