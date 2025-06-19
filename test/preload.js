const { contextBridge } = require('electron');
const {
  TinyElectronClient,
  TinyDb,
  TinyElectronNotification,
  TinyWindowFrameManager,
} = require('../preload/index.cjs');
const { RootEvents } = require('../global/Events.cjs');

// Init
const client = new TinyElectronClient();
client.installWinScript();
client.requestCache();
const { removeLoading } = client.installLoadingPage();
setTimeout(removeLoading, 1000);

const createRootEvent = (eventName) =>
  client.on(eventName, (value) => console.log(eventName, value));
for (const name in RootEvents) createRootEvent(RootEvents[name]);

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
  notiTest: async () => {
    const tinyNoti = await notifications.create({
      tag: 'yay',
      title: 'Test Notification',
      body: 'Click, reply, or press an action button!',
      actions: [
        { type: 'button', text: 'Action 1' },
        { type: 'button', text: 'Action 2' },
      ],
      closeButtonText: 'Close it',
      hasReply: true,
      replyPlaceholder: 'Type your reply here...',
    });

    tinyNoti.on('show', () => console.log('yay! Tiny notification show!'));
    tinyNoti.on('click', () => console.log('yay! Tiny notification clicked!'));
    tinyNoti.on('close', () => console.log('yay! Tiny notification closed!'));
    tinyNoti.on('failed', (errMsg) => console.log('yay! Tiny notification error!', errMsg));
    tinyNoti.on('reply', (reply) => console.log('yay! Tiny notification reply!', reply));
    tinyNoti.on('click', (index) => console.log('yay! Tiny notification action!', index));

    tinyNoti.on('all', (arg) => console.log(arg));

    tinyNoti.show();
  },
});

client.on(RootEvents.ReadyToShow, () => client.requestCache());
client.on(RootEvents.Ready, () => {
  client.requestCache();
  const win = new TinyWindowFrameManager({
    client,
    buttonsPosition: 'right',
    titlePosition: 'center',
  });

  win.setTitle('My Pudding App');
  win.setIcon('../icons/favicon.png');

  win.addMenuButton('Home', () => console.log('Home'));
  win.addMenuButton('Settings', () => console.log('Settings'));
  setTimeout(() => {
    win.hideMenu();
    setTimeout(() => win.showMenu(), 1000);
  }, 5000);
});
