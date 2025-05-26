// src/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import * as path from 'path';
import { getToolsDirectoryPath } from './core/toolsManager';
import * as gitManager from './core/gitManager'; 
import * as processManager from './core/processManager'; // Added processManager

let mainWindow: BrowserWindow | null = null;

autoUpdater.logger = console;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }
  mainWindow.on('closed', () => mainWindow = null);
}

// Function to send general status messages (e.g., auto-updates)
function sendStatusToWindow(channel: string, message: any) {
  if (mainWindow) {
    mainWindow.webContents.send(channel, message);
  }
}

// Function to send Git operation status/progress
function sendGitStatusToWindow(projectId: string, channel: 'progress' | 'result', data: any) {
  if (mainWindow) {
    mainWindow.webContents.send(`git-operation-status-${projectId}`, { channel, ...data });
  }
}

// Function to send process output to renderer
function sendProcessOutputToWindow(output: processManager.ProcessOutput) {
  if (mainWindow) {
    mainWindow.webContents.send('process-output', output);
  }
}

// Function to send process termination info to renderer
function sendProcessTerminationToWindow(termination: processManager.ProcessTermination) {
  if (mainWindow) {
    mainWindow.webContents.send('process-termination', termination);
  }
}
    
app.whenReady().then(() => {
  // Existing IPC Handlers
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('get-tools-directory', getToolsDirectoryPath);
  ipcMain.on('check-for-updates-manual', () => { autoUpdater.checkForUpdatesAndNotify(); });
  ipcMain.on('quit-and-install-update', () => { autoUpdater.quitAndInstall(); });

  // Git IPC Handlers
  ipcMain.handle('git-clone', async (event, { projectId, repoUrl, targetDirectoryName }: { projectId: string, repoUrl: string, targetDirectoryName: string }) => {
    const cloningBaseDir = gitManager.getProjectCloningBaseDir(app); 
    sendGitStatusToWindow(projectId, 'progress', { phase: 'starting_clone', progress: 0, message: `Starting clone for ${targetDirectoryName}` });
    try {
        const result = await gitManager.cloneRepository(repoUrl, targetDirectoryName, cloningBaseDir, (progress) => {
          sendGitStatusToWindow(projectId, 'progress', progress);
        });
        sendGitStatusToWindow(projectId, 'result', result); 
        return result; 
    } catch (error: any) {
        const errorResult = { success: false, error: error.message || 'Unknown error during clone invocation' };
        sendGitStatusToWindow(projectId, 'result', errorResult);
        return errorResult;
    }
  });
  ipcMain.handle('git-pull', async (event, { projectId, repoPath }: { projectId: string, repoPath: string }) => {
    sendGitStatusToWindow(projectId, 'progress', { phase: 'starting_pull', progress: 0, message: `Starting pull for ${repoPath}` });
    const result = await gitManager.pullRepository(repoPath, (progress) => {
      sendGitStatusToWindow(projectId, 'progress', progress);
    });
    sendGitStatusToWindow(projectId, 'result', result);
    return result;
  });
  ipcMain.handle('git-status', async (event, { repoPath }: { repoPath: string }) => {
    return await gitManager.getRepoStatus(repoPath);
  });

  // Process Execution IPC Handlers
  ipcMain.handle('execute-command', (
    event, 
    { projectId, command, args, cwd }: { projectId: string, command: string, args: string[], cwd: string }
  ) => {
    return processManager.executeCommand(
      projectId,
      command,
      args,
      cwd,
      sendProcessOutputToWindow,      // Callback for stdout/stderr/system messages
      sendProcessTerminationToWindow  // Callback for process close/exit
    );
  });
  ipcMain.handle('kill-process', (event, { processId }: { processId: string }) => {
    return processManager.killProcess(processId);
  });

  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => { sendStatusToWindow('update-status', { msg: 'Checking for update...' }); });
autoUpdater.on('update-available', (info: UpdateInfo) => { sendStatusToWindow('update-status', { msg: `Update available: ${info.version}`, available: true, info }); });
autoUpdater.on('update-not-available', () => { sendStatusToWindow('update-status', { msg: 'Update not available.', notAvailable: true }); });
autoUpdater.on('error', (err) => { sendStatusToWindow('update-status', { msg: `Error in auto-updater: ${err.message}`, error: true, err }); });
autoUpdater.on('download-progress', (progressObj: ProgressInfo) => { sendStatusToWindow('update-status', { msg: `Downloading update: ${Math.round(progressObj.percent)}%`, progress: progressObj }); });
autoUpdater.on('update-downloaded', (info: UpdateInfo) => { sendStatusToWindow('update-status', { msg: `Update downloaded: ${info.version}. Restart to install.`, downloaded: true, info });});
