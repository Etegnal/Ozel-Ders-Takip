const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "KOÇ",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  });

  const SITE_URL = 'https://koc-one.vercel.app/';

  // Clear session cache and load the exact web app URL with no-cache headers
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL(SITE_URL, {
      extraHeaders: 'pragma: no-cache\r\nCache-Control: no-cache, no-store, must-revalidate\r\n'
    });
  }).catch(() => {
    mainWindow.loadURL(SITE_URL);
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Enable reloading without cache and developer tools with keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      mainWindow.webContents.session.clearCache().then(() => {
        mainWindow.webContents.reloadIgnoringCache();
      });
      event.preventDefault();
    }
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });
}

// Single instance lock - prevent multiple instances of the app from running
const additionalData = { myKey: 'coach-desktop-app' };
const gotTheLock = app.requestSingleInstanceLock(additionalData);

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
