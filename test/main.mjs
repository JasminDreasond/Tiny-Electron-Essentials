import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { app, Tray } from 'electron';
import { TinyElectronRoot } from '../main/index.mjs';
import { RootEvents } from '../global/Events.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start Electron root
const root = new TinyElectronRoot({
  minimizeOnClose: false,
  pathBase: path.join(__dirname, 'renderer'),
  iconFolder: path.join(__dirname, 'icons'),
  icon: 'favicon',
  appId: 'tiny-electron-essentials',
  appDataName: 'tiny-electron-essentials',
  title: 'Tiny Electron Essentials',
});

const responder = root.getIpcResponder();

// Fix windows OS
root.installWinProtection();

// Init appData
root.initAppDataDir();
root.initAppDataSubdir('tiny-test');
const appDataPrivate = root.getAppDataSubdir('tiny-test');
const initFile = path.join(appDataPrivate, 'init.json');

console.log(root.getAppDataDir());
console.log(appDataPrivate);
console.log(initFile);

// Tray
root.on(RootEvents.Ready, () => {
  const tray = new Tray(root.getIcon());
  tray.setToolTip(root.getTitle());
  tray.setTitle(root.getTitle());
  root.registerTray('main', tray);
  root.onTrayClick('main', () => console.log('Tray tiny click!'));
});

// Ready to first window
root.on(RootEvents.CreateFirstWindow, () => {
  console.log(`gotTheLock: ${root.gotTheLock()}`);
  console.log(`getAppId: ${root.getAppId()}`);
  console.log(`getTitle: ${root.getTitle()}`);
  console.log(`getIconFolder: ${root.getIconFolder()}`);
  console.log(`getIcon: ${root.getIcon()}`);
  console.log(`getAppDataName: ${root.getAppDataName()}`);
  console.log(`getUnpackedFolder: ${JSON.stringify(root.getUnpackedFolder(), null, 2)}`);

  const instance = root.createWindow({
    config: {
      width: 800,
      height: 600,
      icon: root.getIcon(),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        nodeIntegration: true,
        contextIsolation: true,
      },
    },
    fileId: initFile,
  });

  root.setRequestCache(() => ({
    isQuiting: root.isQuiting(),
    appStarted: instance.isReady(),
    firstTime: root.isFirstTime(),
    appReady: root.isAppReady(),
  }));

  root.on(RootEvents.ReadyToShow, () => {
    instance.ping({
      exe: app.getPath('exe'),
      icon: root.getIcon(),
      title: root.getTitle(),
    });
  });

  console.log(`Instance index: ${instance.getIndex()}`);

  responder.on('get-user-data', async (_event, payload, respond) => {
    try {
      const user = { result: 'pudding', time: Date.now(), ...payload };
      respond(user);
    } catch (err) {
      respond(null, err.message);
    }
  });

  instance.loadPath('index.html');
  instance.openDevTools({ mode: 'detach' }); // ou 'bottom', 'right', etc.
});

// Init app
root.init();
