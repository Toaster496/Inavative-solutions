const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getHostStatus: () => ipcRenderer.invoke('get-host-status'),
  startHosting: () => ipcRenderer.invoke('start-hosting'),
  stopHosting: () => ipcRenderer.invoke('stop-hosting'),
  updateConfig: (config) => ipcRenderer.invoke('update-config', config),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  withdrawEarnings: () => ipcRenderer.invoke('withdraw-earnings'),
  
  // Platform info
  platform: process.platform,
  versions: process.versions
});
