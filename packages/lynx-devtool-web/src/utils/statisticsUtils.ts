// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { getBuildVersion, getRuntimeType, isInElectron, isOfflineMode } from './const';
import { getSelectClient } from './storeUtils';
import { getGitInfo, getLDTVersion } from '@/api/api';
import { getStore } from './flooks';
import useUser from '@/store/user';
import { StatisticsCustomEventData } from '@lynx-dev/lynx-devtool-utils';

export interface IStatistics {
  init(data: { bid: string; release: string }): void;
  contextSet(key: string, value: string): void;
  contextMerge(data: any): void;
  start(): void;
  sendEvent(data: {
    name: string;
    categories: Record<string, any>;
    metrics: Record<string, any>;
  }): void;
}

class StatisticsManager {
  private static instance: IStatistics;

  static setInstance(statistics: IStatistics) {
    StatisticsManager.instance = statistics;
  }

  public static getInstance(): IStatistics {
    if (!StatisticsManager.instance) {
      console.info('Statistics instance not initialized');
    }
    return StatisticsManager.instance;
  }
}

// Keep the original public interface.
export function mergeContext(data: any) {
  StatisticsManager.getInstance()?.contextMerge(data);
}

export async function initStatistics() {
  const instance = StatisticsManager.getInstance();
  instance?.init({
    bid: 'lynx_devtool',
    release: getBuildVersion()
  });
  
  instance?.contextSet('runtime_type', getRuntimeType());
  instance?.contextSet('runtime_env', isInElectron() ? 'electron' : 'browser');

  if (isOfflineMode()) {
    try {
      const resp = await getLDTVersion();
      const { code, data } = resp.data;
      if (code === 0) {
        instance?.contextSet('cli_version', data);
      }
    } catch (error) {}
  }

  const { user } = getStore(useUser);

  try {
    const resp = await getGitInfo();
    const { code, data } = resp.data;
    if (code === 0) {
      mergeContext(data);
    }
  } catch (error) {}

  instance?.start();
}

export function sendStatisticsEvent(data: StatisticsCustomEventData) {
  const selectedDevice = getSelectClient();
  const { name, categories, metrics } = data;
  
  StatisticsManager.getInstance()?.sendEvent({
    name,
    categories: {
      appId: selectedDevice.info?.appId ?? selectedDevice.info?.App,
      did: selectedDevice.info?.did ?? '',
      osType: selectedDevice.info?.osType ?? 'unknown',
      ...categories
    },
    metrics: metrics ?? {}
  });
}

export const setStatisticsInstance = StatisticsManager.setInstance;
