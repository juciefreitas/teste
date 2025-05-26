import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater'; // Import autoUpdater and relevant types
import * as path from 'path';
import { getToolsDirectoryPath } from './core/toolsManager';

// Keep a reference to mainWindow
let mainWindow: BrowserWindow | null = null;

// Configure logging for autoUpdater - Optional, but helpful for debugging
autoUpdater.logger = console; // Directs autoUpdater logs to the main process console

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // If you plan to use a preload script
      nodeIntegration: false, // Disable Node.js integration in renderer for security
      contextIsolation: true, // Protect against prototype pollution
    },
  });

  // Load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000'); // Load from Vite dev server
  } else {
    // Production: load the built index.html from dist/renderer
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // mainWindow.webContents.openDevTools(); // Open DevTools if needed
  mainWindow.on('closed', () => mainWindow = null); // Dereference on close
}

function sendStatusToWindow(channel: string, message: any) {
  if (mainWindow) {
    mainWindow.webContents.send(channel, message);
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('get-tools-directory', getToolsDirectoryPath);

  ipcMain.on('check-for-updates-manual', () => {
    console.log('Manual update check triggered.');
    autoUpdater.checkForUpdatesAndNotify();
  });
  
  ipcMain.on('quit-and-install-update', () => {
    autoUpdater.quitAndInstall();
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Check for updates on startup (after window is created)
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('update-status', { msg: 'Checking for update...' });
});
autoUpdater.on('update-available', (info: UpdateInfo) => {
  sendStatusToWindow('update-status', { msg: `Update available: ${info.version}`, available: true, info });
});
autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('update-status', { msg: 'Update not available.', notAvailable: true });
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('update-status', { msg: `Error in auto-updater: ${err.message}`, error: true, err });
});
autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
  sendStatusToWindow('update-status', { 
    msg: `Downloading update: ${Math.round(progressObj.percent)}%`, 
    progress: progressObj 
  });
});
autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
  sendStatusToWindow('update-status', { 
    msg: `Update downloaded: ${info.version}. Restart to install.`, 
    downloaded: true, 
    info 
  });
});
