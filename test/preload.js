const { contextBridge, ipcRenderer } = require('electron');
const { TinyIpcRequestManager } = require('../preload/index.cjs');

const manager = new TinyIpcRequestManager();

contextBridge.exposeInMainWorld('api', {
  getUser: () => manager.send('get-user-data', { userId: 123 }, { timeout: 3000 }),
  ping: () => ipcRenderer.invoke('ping'),
});
