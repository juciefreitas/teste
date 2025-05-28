"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload.ts
const electron_1 = require("electron"); // Ensure imports
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Git functions (ensure these are complete and correct from previous steps)
    gitClone: (args) => electron_1.ipcRenderer.invoke('git-clone', args),
    gitPull: (args) => electron_1.ipcRenderer.invoke('git-pull', args),
    gitStatus: (args) => electron_1.ipcRenderer.invoke('git-status', args),
    onGitOperationStatus: (projectId, callback) => {
        const channel = `git-operation-status-${projectId}`;
        electron_1.ipcRenderer.on(channel, callback);
        return () => electron_1.ipcRenderer.removeListener(channel, callback);
    },
    // Existing app/update functions
    getVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    getToolsDirectory: () => electron_1.ipcRenderer.invoke('get-tools-directory'),
    checkForUpdates: () => electron_1.ipcRenderer.send('check-for-updates-manual'),
    onUpdateStatus: (callback) => {
        electron_1.ipcRenderer.on('update-status', callback);
        return () => electron_1.ipcRenderer.removeListener('update-status', callback);
    },
    quitAndInstallUpdate: () => electron_1.ipcRenderer.send('quit-and-install-update'),
    // Process execution functions
    executeCommand: (args) => electron_1.ipcRenderer.invoke('execute-command', args),
    killProcess: (args) => electron_1.ipcRenderer.invoke('kill-process', args),
    onProcessOutput: (callback) => {
        const channel = 'process-output'; // Channel name must match main.ts
        electron_1.ipcRenderer.on(channel, callback);
        return () => electron_1.ipcRenderer.removeListener(channel, callback);
    },
    onProcessTermination: (callback) => {
        const channel = 'process-termination'; // Channel name must match main.ts
        electron_1.ipcRenderer.on(channel, callback);
        return () => electron_1.ipcRenderer.removeListener(channel, callback);
    }
});
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type] || 'N/A');
    }
    console.log('Preload script fully executed.');
});
