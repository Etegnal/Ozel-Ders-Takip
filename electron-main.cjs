const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = path.join(__dirname, 'public', 'favicon.ico');

  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 720,
    title: 'KOÇ · Özel Ders ve Öğrenci Takip Sistemi',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('https://koc-one.vercel.app/');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle('KOÇ · Özel Ders ve Öğrenci Takip Sistemi');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
