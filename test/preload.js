const { contextBridge, ipcRenderer } = require('electron');
const { TinyElectronClient } = require('../preload/index.cjs');

const client = new TinyElectronClient();
const manager = client.getIpcRequest();

contextBridge.exposeInMainWorld('api', {
  getUser: () => manager.send('get-user-data', { userId: 123 }, { timeout: 3000 }),
  ping: () => ipcRenderer.invoke('ping'),
});
