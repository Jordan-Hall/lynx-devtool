// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as UI from '../../legacy/legacy.js';

// eslint-disable-next-line rulesdir/es_modules_import
import type * as LinearMemoryInspector from './linear_memory_inspector.js';

import * as i18n from '../../../core/i18n/i18n.js';
const UIStrings = {
  /**
  *@description Title of the Linear Memory Inspector tool
  */
  memoryInspector: 'Memory Inspector',
  /**
  *@description Command for showing the 'Memory Inspector' tool
  */
  showMemoryInspector: 'Show Memory Inspector',
};
const str_ =
    i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/linear_memory_inspector-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);

let loadedLinearMemoryInspectorModule: (typeof LinearMemoryInspector|undefined);

async function loadLinearMemoryInspectorModule(): Promise<typeof LinearMemoryInspector> {
  if (!loadedLinearMemoryInspectorModule) {
    loadedLinearMemoryInspectorModule = await import('./linear_memory_inspector.js');
  }
  return loadedLinearMemoryInspectorModule;
}

// UI.ViewManager.registerViewExtension({
//   location: UI.ViewManager.ViewLocationValues.DRAWER_VIEW,
//   id: 'linear-memory-inspector',
//   title: i18nLazyString(UIStrings.memoryInspector),
//   commandPrompt: i18nLazyString(UIStrings.showMemoryInspector),
//   order: 100,
//   persistence: UI.ViewManager.ViewPersistence.CLOSEABLE,
//   async loadView() {
//     const LinearMemoryInspector = await loadLinearMemoryInspectorModule();
//     return LinearMemoryInspector.LinearMemoryInspectorPane.Wrapper.instance();
//   },
// });
