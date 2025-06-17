const { contextBridge } = require('electron');
const { TinyElectronClient, TinyDb, TinyElectronNotification } = require('../preload/index.cjs');

// Init
const client = new TinyElectronClient();
client.installWinScript();
const { removeLoading } = client.installLoadingPage();
setTimeout(removeLoading, 1000);

// Idle time test
setTimeout(async () => {
  const idle = await client.systemIdleTime();
  console.log(idle);
  if (idle > 0) console.log(await client.systemIdleState(idle));
}, 1000);

// Get manager
const manager = client.getIpcRequest();

// Tiny Db
const tinyDb = new TinyDb(manager, 'db');
tinyDb.exposeInMainWorld('tinyDb');

// Notifications
const notifications = new TinyElectronNotification({ ipcRequest: manager });
notifications.installWinScript();

// Test
contextBridge.exposeInMainWorld('api', {
  getUser: () => manager.send('get-user-data', { userId: 123 }, { timeout: 3000 }),
});
