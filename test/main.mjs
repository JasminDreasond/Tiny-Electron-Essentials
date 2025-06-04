import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'renderer/index.html'));
  win.webContents.openDevTools({ mode: 'detach' }); // ou 'bottom', 'right', etc.
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ping', async () => {
  return 'pong from main process';
});
