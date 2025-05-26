// src/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'; // Ensure imports

contextBridge.exposeInMainWorld('electronAPI', {
  // Git functions (ensure these are complete and correct from previous steps)
  gitClone: (args: { projectId: string, repoUrl: string, targetDirectoryName: string }) => ipcRenderer.invoke('git-clone', args),
  gitPull: (args: { projectId: string, repoPath: string }) => ipcRenderer.invoke('git-pull', args),
  gitStatus: (args: { repoPath: string }) => ipcRenderer.invoke('git-status', args),
  onGitOperationStatus: (projectId: string, callback: (event: IpcRendererEvent, status: any) => void) => {
    const channel = `git-operation-status-${projectId}`;
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeListener(channel, callback); 
  },

  // Existing app/update functions
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getToolsDirectory: () => ipcRenderer.invoke('get-tools-directory'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates-manual'),
  onUpdateStatus: (callback: (event: IpcRendererEvent, status: any) => void) => {
    ipcRenderer.on('update-status', callback);
    return () => ipcRenderer.removeListener('update-status', callback);
  },
  quitAndInstallUpdate: () => ipcRenderer.send('quit-and-install-update'),

  // Process execution functions
  executeCommand: (args: { projectId: string, command: string, args: string[], cwd: string }) => 
    ipcRenderer.invoke('execute-command', args),
  killProcess: (args: { processId: string }) => 
    ipcRenderer.invoke('kill-process', args),
  onProcessOutput: (callback: (event: IpcRendererEvent, output: any /* ProcessOutputData */) => void) => {
    const channel = 'process-output'; // Channel name must match main.ts
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeListener(channel, callback);
  },
  onProcessTermination: (callback: (event: IpcRendererEvent, termination: any /* ProcessTerminationData */) => void) => {
    const channel = 'process-termination'; // Channel name must match main.ts
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeListener(channel, callback);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions] || 'N/A');
  }
  console.log('Preload script fully executed.');
});
