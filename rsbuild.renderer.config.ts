import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  plugins: [
    pluginBabel(),
  ],
  source: {
    entry: {
      renderer: './src/renderer/index.tsx'
    },
    alias: {
      '@': './src'
    }
  },
  output: {
    distPath: {
      root: 'dist',
      js: 'renderer',
    },
    target: 'web',
    cleanDistPath: true,
  },
  tools: {
    rspack: {
      target: 'electron-renderer'
    }
  }
}); 