const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC communication interface
contextBridge.exposeInMainWorld('ldtElectronAPI', {
  send: (name, params) => ipcRenderer.send(name, params),
  invoke: (name, params) => ipcRenderer.invoke(name, params),
  on: (key, listener) => ipcRenderer.on(key, listener),
  once: (key, listener) => ipcRenderer.once(key, listener),
  off: (key, listener) => ipcRenderer.off(key, listener)
});

// Expose necessary process information
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    // Add other required environment variables
  },
  versions: {
    node: process.versions.node,
    electron: process.versions.electron
  }
});
