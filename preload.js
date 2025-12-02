const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

contextBridge.exposeInMainWorld('electronAPI', {
  onBackendReady: (callback) => {
    // Optional: we can emit when backend is ready
    // For now, just call immediately
    setTimeout(callback, 1000);
  }
});