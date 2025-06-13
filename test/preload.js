const { contextBridge, ipcRenderer } = require('electron');
const { TinyElectronClient } = require('../preload/index.cjs');

const client = new TinyElectronClient();
client.installWinScript();
const { removeLoading } = client.installLoadingPage();
setTimeout(removeLoading, 1000);

setTimeout(async () => {
  const idle = await client.systemIdleTime();
  console.log(idle);
  if (idle > 0) console.log(await client.systemIdleState(idle));
}, 1000);

const manager = client.getIpcRequest();

contextBridge.exposeInMainWorld('api', {
  getUser: () => manager.send('get-user-data', { userId: 123 }, { timeout: 3000 }),
  ping: () => ipcRenderer.invoke('ping'),
});
