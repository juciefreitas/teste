// src/electron.d.ts
export interface IElectronAPI {
  getVersion: () => Promise<string>;
  getToolsDirectory: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
