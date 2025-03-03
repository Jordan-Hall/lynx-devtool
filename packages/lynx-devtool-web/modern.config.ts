import appTools, { defineConfig } from '@modern-js/app-tools';
import { version } from './package.json';

export default defineConfig({
  runtime: {
    router: false
  },
  dev: {
    hmr: true
  },
  source: {
    preEntry: './src/common/polyfill.ts',
    globalVars: {
      'process.env.LDT_BUILD_TYPE': JSON.stringify(process.env.LDT_BUILD_TYPE),
      'process.env.BUILD_VERSION': JSON.stringify(process.env.BUILD_VERSION ?? version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
      // keep the complete definition of window.process
      'window.process': JSON.stringify({
        env: {
          NODE_ENV: process.env.NODE_ENV ?? 'development',
          LDT_BUILD_TYPE: process.env.LDT_BUILD_TYPE,
          BUILD_VERSION: process.env.BUILD_VERSION ?? version
        }
      })
    },
    alias: {
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer')
    }
  },
  output: {
    svgDefaultExport: 'component'
  },
  html: {
    templateParameters: (params) => {
      // in offline mode, disable the entry page cache to prevent automatic upgrades from causing page opening failures
      if (process.env.LDT_BUILD_TYPE === 'offline') {
        params.meta += `\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">`;
      }
      params.meta += '<meta name="referrer" content="never">';
      return params;
    }
  },
  plugins: [appTools({
    bundler: 'rspack'
  })],
  tools: {
    rspack: {
      plugins: [
      ]
    }
  }
});
