// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import fs from 'fs/promises';
import path from 'path';
import { LDT_DIR } from '../cli/utils';

interface LDTConfig {
  region?: 'cn' | 'non-cn';
}

const LDT_CONFIG_PATH = path.join(LDT_DIR, 'config.json');
let config: LDTConfig = {};
let initialized = false;

async function writeConfig() {
  try {
    const data = JSON.stringify(config);
    await fs.writeFile(LDT_CONFIG_PATH, data, 'utf8');
  } catch (error) {
    console.error('Writing LDT config failed');
  }
}

async function initializeConfig() {
  if (initialized) {
    return;
  }
  if (
    !(await fs
      .access(LDT_CONFIG_PATH)
      .then(() => true)
      .catch(() => false))
  ) {
    writeConfig();
  } else {
    try {
      const data = await fs.readFile(LDT_CONFIG_PATH, 'utf8');
      config = JSON.parse(data);
    } catch (error) {
      console.error('Reading LDT config failed');
    }
  }
  initialized = true;
}

export async function getConfigItem(key: keyof LDTConfig) {
  await initializeConfig();
  return config[key];
}

export async function setConfigItem(key: keyof LDTConfig, value: LDTConfig[typeof key]) {
  await initializeConfig();
  config[key] = value;
  writeConfig();
}
