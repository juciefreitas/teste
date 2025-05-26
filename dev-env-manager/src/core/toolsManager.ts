import { app } from 'electron'; // Requires running in main process or using ipc
import * as path from 'path';
import * as fs from 'fs'; // Node's File System module

// This function should ideally be called from the main process
// or its result passed to the renderer via IPC if needed there.
export function getToolsDirectoryPath(): string {
  // app.getPath('userData') is the standard place for app-specific data.
  // We'll create a 'portable-tools' subdirectory within it.
  const userDataPath = app.getPath('userData');
  const toolsPath = path.join(userDataPath, 'portable-tools');

  // Ensure the directory exists
  if (!fs.existsSync(toolsPath)) {
    fs.mkdirSync(toolsPath, { recursive: true });
  }
  return toolsPath;
}

// Example of how you might want to get a specific tool's path
export function getSpecificToolPath(toolName: string, version?: string): string | null {
    const toolsBaseDir = getToolsDirectoryPath();
    const toolDir = version ? path.join(toolsBaseDir, toolName, version) : path.join(toolsBaseDir, toolName);
    // This is a simplified check; real check would be more robust (e.g., look for an executable)
    if (fs.existsSync(toolDir)) {
        return toolDir;
    }
    return null;
}

// We also need a way for renderer to request this path if it doesn't have access to 'app'
// This will be handled via IPC.
