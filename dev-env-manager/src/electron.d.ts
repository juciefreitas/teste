// src/electron.d.ts
import { IpcRendererEvent } from 'electron'; // Import if not already there

export interface UpdateStatusInfo {
  msg: string;
  available?: boolean;
  notAvailable?: boolean;
  downloaded?: boolean;
  error?: boolean;
  info?: any; // from UpdateInfo
  progress?: any; // from ProgressInfo
}

export interface IElectronAPI {
  getVersion: () => Promise<string>;
  getToolsDirectory: () => Promise<string>;
  // Auto-update
  checkForUpdates: () => void;
  onUpdateStatus: (callback: (event: IpcRendererEvent, status: UpdateStatusInfo) => void) => () => void; // Function returns a cleanup function
  quitAndInstallUpdate: () => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
