import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ipcMain, Tray } from 'electron';
import { TinyElectronRoot, TinyIpcResponder } from '../main/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const responder = new TinyIpcResponder();

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
root.on('Ready', () => {
  const tray = new Tray(root.getIcon());
  tray.setToolTip(root.getTitle());
  tray.setTitle(root.getTitle());
  root.registerTray('main', tray);
});

// Ready to first window
root.on('CreateFirstWindow', () => {
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
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    },
    fileId: initFile,
    isMain: true,
  });

  responder.on('get-user-data', async (payload, respond) => {
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

// Ping
ipcMain.handle('ping', async () => {
  return 'pong from main process';
});

// Init app
root.init();
