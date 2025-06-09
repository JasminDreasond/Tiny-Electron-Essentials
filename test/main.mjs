import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ipcMain } from 'electron';
import { TinyElectronRoot, TinyIpcResponder } from '../main/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const responder = new TinyIpcResponder();

const root = new TinyElectronRoot({
  minimizeOnClose: false,
  pathBase: path.join(__dirname, 'renderer'),
  iconFolder: path.join(__dirname, 'icons'),
  icon: 'favicon',
  appId: 'tiny-electron-essentials',
  appDataName: 'tiny-electron-essentials',
  title: 'Tiny Electron Essentials',
});

root.installWinProtection();

root.on('CreateFirstWindow', () => {
  console.log(`gotTheLock: ${root.gotTheLock()}`);
  console.log(`getAppId: ${root.getAppId()}`);
  console.log(`getTitle: ${root.getTitle()}`);
  console.log(`getIconFolder: ${root.getIconFolder()}`);
  console.log(`getIcon: ${root.getIcon()}`);
  console.log(`getAppDataName: ${root.getAppDataName()}`);

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
    isMain: true,
  });

  const win = instance.getWin();

  responder.on('get-user-data', async (payload, respond) => {
    try {
      const user = { result: 'pudding', time: Date.now(), ...payload };
      respond(user);
    } catch (err) {
      respond(null, err.message);
    }
  });

  root.loadPath(win, 'index.html');
  root.openDevTools(win, { mode: 'detach' }); // ou 'bottom', 'right', etc.
});

ipcMain.handle('ping', async () => {
  return 'pong from main process';
});

root.init();
