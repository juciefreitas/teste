// src/core/gitManager.ts
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path'; // Ensure path is imported

export const getProjectCloningBaseDir = (electronApp: Electron.App): string => {
  const baseDir = path.join(electronApp.getPath('userData'), 'cloned_projects');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
};

export interface GitProgressEvent {
  phase: string;
  progress: number; 
  processed: number;
  total: number;
  message?: string; 
}

type GitProgressCallback = (progress: GitProgressEvent) => void;

const createGitInstance = (basePath: string): SimpleGit => {
  const options: Partial<SimpleGitOptions> = {
    baseDir: basePath,
    binary: 'git', 
    maxConcurrentProcesses: 6,
  };
  return simpleGit(options);
};

export async function cloneRepository(
  repoUrl: string, 
  targetDirectoryName: string, 
  cloningBaseDir: string, 
  progressCallback?: GitProgressCallback
): Promise<{ path: string; success: boolean; error?: string }> {
  const localPath = path.join(cloningBaseDir, targetDirectoryName);

  if (fs.existsSync(localPath)) {
    try {
        const git = createGitInstance(localPath);
        if (await git.checkIsRepo()) {
            return { path: localPath, success: true, error: 'Directory already exists and is a git repository.' };
        } else {
             return { path: localPath, success: false, error: 'Directory already exists but is not a git repository.' };
        }
    } catch (err: any) {
         return { path: localPath, success: false, error: `Directory check failed: ${err.message}` };
    }
  }
  
  // Intentionally not using createGitInstance(cloningBaseDir) here because spawn needs cwd
  // const git = createGitInstance(cloningBaseDir); 

  try {
    console.log(`Cloning ${repoUrl} into ${localPath}...`);
    progressCallback?.({ phase: 'cloning', progress: 0, processed:0, total:100, message: 'Clone initiated' });
    
    // Using a direct spawn approach for better progress for clone
    // as simple-git's built-in clone progress is limited.
    const { spawn } = await import('child_process');
    const child = spawn('git', ['clone', repoUrl, targetDirectoryName, '--progress'], { cwd: cloningBaseDir, stdio: ['ignore', 'pipe', 'pipe'], shell: true });

    let cloneError = '';
    child.stdout?.on('data', (data) => {
        // Git clone --progress often sends to stderr, but some messages might be on stdout
        // console.log(`Clone stdout: ${data}`);
    });
    child.stderr?.on('data', (data) => {
        const message = data.toString();
        // console.log(`Clone stderr: ${message}`); // For debugging
        // Try to parse progress from stderr
        // Example: "Cloning into 'targetDirectoryName'...
// Receiving objects:  1% (1/100)"
        const progressMatch = message.match(/Receiving objects:\s*(\d+)%\s*\((\d+)\/(\d+)\)/) || message.match(/Resolving deltas:\s*(\d+)%\s*\((\d+)\/(\d+)\)/);
        if (progressMatch) {
            progressCallback?.({
                phase: message.includes('Receiving') ? 'receiving' : 'resolving',
                progress: parseInt(progressMatch[1], 10),
                processed: parseInt(progressMatch[2], 10),
                total: parseInt(progressMatch[3], 10),
            });
        } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fatal')) {
            cloneError += message;
        }
    });

    return new Promise((resolve, reject) => {
        child.on('close', (code) => {
            if (code === 0) {
                progressCallback?.({ phase: 'cloning', progress: 100, processed:100, total:100, message: 'Clone completed' });
                console.log(`Successfully cloned ${repoUrl} to ${localPath}`);
                resolve({ path: localPath, success: true });
            } else {
                const errorMsg = cloneError || `Git clone process exited with code ${code}`;
                console.error(`Failed to clone ${repoUrl}: ${errorMsg}`);
                progressCallback?.({ phase: 'cloning', progress: 100, processed:0, total:100, message: `Error: ${errorMsg}` });
                // IMPORTANT: Resolve with failure, do not reject for IPC to work as expected with invoke
                resolve({ path: localPath, success: false, error: errorMsg });
            }
        });
        child.on('error', (err) => { // Handle spawn errors
             console.error(`Spawn error during clone: ${err.message}`);
             progressCallback?.({ phase: 'cloning', progress: 100, processed:0, total:100, message: `Spawn Error: ${err.message}` });
             // IMPORTANT: Resolve with failure
             resolve({ path: localPath, success: false, error: `Spawn error: ${err.message}` });
        });
    });

  } catch (error: any) { // Catch errors from setup, not from spawn itself here
    console.error(`Setup error for clone ${repoUrl}: ${error.message}`);
    progressCallback?.({ phase: 'cloning', progress: 100, processed:0, total:100, message: `Error: ${error.message}` });
    return { path: localPath, success: false, error: error.message };
  }
}

export async function pullRepository(
  repoPath: string,
  progressCallback?: GitProgressCallback
): Promise<{ success: boolean; summary?: any; error?: string }> {
  if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
    return { success: false, error: 'Repository path does not exist or is not a directory.' };
  }
  
  const git = createGitInstance(repoPath);
  if (!(await git.checkIsRepo())) {
     return { success: false, error: 'Not a git repository at the specified path.' };
  }

  try {
    console.log(`Pulling repository at ${repoPath}...`);
    git.outputHandler((_command, stdout, stderr) => {
        const processOutput = (data: Buffer, type: 'stdout' | 'stderr') => {
            const text = data.toString();
            // console.log(`Pull ${type}: ${text}`); // Debugging
            const match = text.match(/Receiving objects:\s*(\d+)%\s*\((\d+)\/(\d+)\)/) || text.match(/Resolving deltas:\s*(\d+)%\s*\((\d+)\/(\d+)\)/);
            if (match && progressCallback) {
                progressCallback({
                    phase: text.includes('Receiving') ? 'receiving' : 'resolving',
                    progress: parseInt(match[1], 10),
                    processed: parseInt(match[2], 10),
                    total: parseInt(match[3], 10),
                });
            } else if (type === 'stderr' && text.trim().length > 0 && progressCallback) {
                // Send other significant stderr messages
                // progressCallback({ phase: 'info', progress: 0, processed: 0, total: 0, message: text.trim() });
            }
        };
        stdout.on('data', data => processOutput(data, 'stdout'));
        stderr.on('data', data => processOutput(data, 'stderr'));
    });

    progressCallback?.({ phase: 'pull', progress: 0, processed:0, total:0, message: 'Pull initiated' });
    const summary = await git.pull(['--progress']); 
    console.log('Pull successful.', summary);
    progressCallback?.({ phase: 'pull', progress: 100, processed: summary.files?.length || 0, total:summary.files?.length || 0, message: 'Pull completed' });
    return { success: true, summary };
  } catch (error: any) {
    console.error(`Failed to pull repository at ${repoPath}: ${error.message}`);
    progressCallback?.({ phase: 'pull', progress: 100, message: `Error: ${error.message}`, processed:0, total:0 });
    return { success: false, error: error.message };
  }
}

export async function getRepoStatus(repoPath: string): Promise<any> {
    if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
        return { error: 'Repository path does not exist or is not a directory.' };
    }
    const git = createGitInstance(repoPath);
    if (!(await git.checkIsRepo())) {
        return { error: 'Not a git repository.' };
    }
    try {
        const status = await git.status();
        return status;
    } catch (error: any) {
        return { error: error.message };
    }
}
