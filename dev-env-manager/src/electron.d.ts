// src/electron.d.ts
import { IpcRendererEvent } from 'electron'; // Ensure import

export interface UpdateStatusInfo { // Keep existing
  msg: string;
  available?: boolean;
  notAvailable?: boolean;
  downloaded?: boolean;
  error?: boolean;
  info?: any; 
  progress?: any; 
}

export interface GitProgressResult { // Keep existing
    path?: string; 
    success: boolean;
    error?: string;
    summary?: any; 
}
export interface GitOperationStatusEvent { // Keep existing
    channel: 'progress' | 'result'; 
    phase?: string; 
    progress?: number; 
    processed?: number; 
    total?: number; 
    message?: string; 
    path?: string; 
    success?: boolean; 
    error?: string; 
    summary?: any;  
}

// New types for Process Management
export interface ProcessOutputData {
  type: 'stdout' | 'stderr' | 'system';
  data: string;
  projectId: string;
  processId?: string;
}

export interface ProcessTerminationData {
  projectId: string;
  processId?: string;
  code: number | null;
  error?: { message: string }; // Error.message is serializable
}

export interface ExecuteCommandResult {
    success: boolean;
    processId?: string;
    error?: string;
}

export interface IElectronAPI {
  // Existing methods
  getVersion: () => Promise<string>; 
  getToolsDirectory: () => Promise<string>; 
  checkForUpdates: () => void; 
  onUpdateStatus: (callback: (event: IpcRendererEvent, status: UpdateStatusInfo) => void) => () => void; 
  quitAndInstallUpdate: () => void; 

  // Git functions
  gitClone: (args: { projectId: string, repoUrl: string, targetDirectoryName: string }) => Promise<GitProgressResult>;
  gitPull: (args: { projectId: string, repoPath: string }) => Promise<GitProgressResult>;
  gitStatus: (args: { repoPath: string }) => Promise<any>; 
  onGitOperationStatus: (projectId: string, callback: (event: IpcRendererEvent, status: GitOperationStatusEvent) => void) => () => void;

  // Process execution
  executeCommand: (args: { projectId: string, command: string, args: string[], cwd: string }) => Promise<ExecuteCommandResult>;
  killProcess: (args: { processId: string }) => Promise<boolean>;
  onProcessOutput: (callback: (event: IpcRendererEvent, output: ProcessOutputData) => void) => () => void;
  onProcessTermination: (callback: (event: IpcRendererEvent, termination: ProcessTerminationData) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
