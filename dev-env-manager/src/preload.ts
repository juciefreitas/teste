// src/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getToolsDirectory: () => ipcRenderer.invoke('get-tools-directory'),
  // Auto-update related
  checkForUpdates: () => ipcRenderer.send('check-for-updates-manual'),
  onUpdateStatus: (callback: (event: IpcRendererEvent, status: any) => void) => {
    ipcRenderer.on('update-status', callback);
    // Return a cleanup function
    return () => ipcRenderer.removeListener('update-status', callback);
  },
  quitAndInstallUpdate: () => ipcRenderer.send('quit-and-install-update')
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
