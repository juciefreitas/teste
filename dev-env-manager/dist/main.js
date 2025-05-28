"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path = __importStar(require("path"));
const toolsManager_1 = require("./core/toolsManager");
const gitManager = __importStar(require("./core/gitManager"));
const processManager = __importStar(require("./core/processManager")); // Added processManager
let mainWindow = null;
electron_updater_1.autoUpdater.logger = console;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
    }
    mainWindow.on('closed', () => mainWindow = null);
}
// Function to send general status messages (e.g., auto-updates)
function sendStatusToWindow(channel, message) {
    if (mainWindow) {
        mainWindow.webContents.send(channel, message);
    }
}
// Function to send Git operation status/progress
function sendGitStatusToWindow(projectId, channel, data) {
    if (mainWindow) {
        mainWindow.webContents.send(`git-operation-status-${projectId}`, Object.assign({ channel }, data));
    }
}
// Function to send process output to renderer
function sendProcessOutputToWindow(output) {
    if (mainWindow) {
        mainWindow.webContents.send('process-output', output);
    }
}
// Function to send process termination info to renderer
function sendProcessTerminationToWindow(termination) {
    if (mainWindow) {
        mainWindow.webContents.send('process-termination', termination);
    }
}
electron_1.app.whenReady().then(() => {
    // Existing IPC Handlers
    electron_1.ipcMain.handle('get-app-version', () => electron_1.app.getVersion());
    electron_1.ipcMain.handle('get-tools-directory', toolsManager_1.getToolsDirectoryPath);
    electron_1.ipcMain.on('check-for-updates-manual', () => { electron_updater_1.autoUpdater.checkForUpdatesAndNotify(); });
    electron_1.ipcMain.on('quit-and-install-update', () => { electron_updater_1.autoUpdater.quitAndInstall(); });
    // Git IPC Handlers
    electron_1.ipcMain.handle('git-clone', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { projectId, repoUrl, targetDirectoryName }) {
        const cloningBaseDir = gitManager.getProjectCloningBaseDir(electron_1.app);
        sendGitStatusToWindow(projectId, 'progress', { phase: 'starting_clone', progress: 0, message: `Starting clone for ${targetDirectoryName}` });
        try {
            const result = yield gitManager.cloneRepository(repoUrl, targetDirectoryName, cloningBaseDir, (progress) => {
                sendGitStatusToWindow(projectId, 'progress', progress);
            });
            sendGitStatusToWindow(projectId, 'result', result);
            return result;
        }
        catch (error) {
            const errorResult = { success: false, error: error.message || 'Unknown error during clone invocation' };
            sendGitStatusToWindow(projectId, 'result', errorResult);
            return errorResult;
        }
    }));
    electron_1.ipcMain.handle('git-pull', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { projectId, repoPath }) {
        sendGitStatusToWindow(projectId, 'progress', { phase: 'starting_pull', progress: 0, message: `Starting pull for ${repoPath}` });
        const result = yield gitManager.pullRepository(repoPath, (progress) => {
            sendGitStatusToWindow(projectId, 'progress', progress);
        });
        sendGitStatusToWindow(projectId, 'result', result);
        return result;
    }));
    electron_1.ipcMain.handle('git-status', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { repoPath }) {
        return yield gitManager.getRepoStatus(repoPath);
    }));
    // Process Execution IPC Handlers
    electron_1.ipcMain.handle('execute-command', (event, { projectId, command, args, cwd }) => {
        return processManager.executeCommand(projectId, command, args, cwd, sendProcessOutputToWindow, // Callback for stdout/stderr/system messages
        sendProcessTerminationToWindow // Callback for process close/exit
        );
    });
    electron_1.ipcMain.handle('kill-process', (event, { processId }) => {
        return processManager.killProcess(processId);
    });
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Auto-updater event listeners
electron_updater_1.autoUpdater.on('checking-for-update', () => { sendStatusToWindow('update-status', { msg: 'Checking for update...' }); });
electron_updater_1.autoUpdater.on('update-available', (info) => { sendStatusToWindow('update-status', { msg: `Update available: ${info.version}`, available: true, info }); });
electron_updater_1.autoUpdater.on('update-not-available', () => { sendStatusToWindow('update-status', { msg: 'Update not available.', notAvailable: true }); });
electron_updater_1.autoUpdater.on('error', (err) => { sendStatusToWindow('update-status', { msg: `Error in auto-updater: ${err.message}`, error: true, err }); });
electron_updater_1.autoUpdater.on('download-progress', (progressObj) => { sendStatusToWindow('update-status', { msg: `Downloading update: ${Math.round(progressObj.percent)}%`, progress: progressObj }); });
electron_updater_1.autoUpdater.on('update-downloaded', (info) => { sendStatusToWindow('update-status', { msg: `Update downloaded: ${info.version}. Restart to install.`, downloaded: true, info }); });
