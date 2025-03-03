import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  plugins: [
    pluginBabel(),
  ],
  source: {
    entry: {
      index: './src/main/index.ts',
      preload: './preload.js'
    },
    alias: {
      '@': './src'
    }
  },
  output: {
    distPath: {
      root: 'dist',
      js: '.'
    },
    target: 'node',
    cleanDistPath: false,
    filename: {
      js: '[name].js'
    },
    filenameHash: false,
    sourceMap: {
      js: 'source-map'
    }
  },
  tools: {
    rspack: {
      target: 'electron-main',
      devtool: 'source-map',
      externals: {
        'electron': 'electron',
        '@electron/remote': '@electron/remote',
        '@lynx-dev/lynx-devtool-cli': '@lynx-dev/lynx-devtool-cli',
        'electron-log': 'electron-log',
        'node-machine-id': 'node-machine-id'
      },
      devServer: {
        hot: true,
        liveReload: false,
        client: {
          overlay: true,
          progress: true
        },
        devMiddleware: {
          writeToDisk: true
        },
        port: 8080,
        setupMiddlewares: (middlewares, server) => {
          console.log('Dev server setup, ensuring dist files are preserved');
          return middlewares;
        },
        onListening: (server) => {
          console.log('Dev server is now listening');
        }
      },
      output: {
        clean: false
      }
    }
  }
}); 