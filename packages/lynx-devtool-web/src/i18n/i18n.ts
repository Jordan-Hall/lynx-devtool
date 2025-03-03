// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './resources';

function convertResource(resource: any) {
  const recursive = (tree: Record<string, any>, lng: 'zh' | 'en') => {
    return Object.entries(tree).reduce((total, cur) => {
      const key = cur[0];
      const value = cur[1];
      if (value[lng]) {
        total[key] = value[lng];
      } else {
        total[key] = recursive(value, lng);
      }

      return total;
    }, {} as Record<string, any>);
  };

  return {
    en: {
      translation: recursive(resource, 'en')
    },
    zh: {
      translation: recursive(resource, 'zh')
    }
  };
}

const resources = convertResource(translations);

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    lng: 'en',
    supportedLngs: ['en'],
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

export default i18n;
