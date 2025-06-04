const { contextBridge, ipcRenderer } = require('electron');
const { TinyIpcRequestManager } = require('../dist/preload/index.cjs');

const manager = new TinyIpcRequestManager();

contextBridge.exposeInMainWorld('api', {
  getUser: () => {
    manager
      .send('get-user-data', { userId: 123 }, { timeout: 3000 })
      .then((response) => {
        console.log('Received:', response);
      })
      .catch((err) => {
        console.error('Failed:', err);
      });
  },
  ping: () => ipcRenderer.invoke('ping'),
});
