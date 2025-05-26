// src/core/processManager.ts
import { spawn, ChildProcess } from 'child_process';
import { IpcMainEvent } from 'electron'; // For typing if we pass main event around

export interface ProcessOutput {
  type: 'stdout' | 'stderr' | 'system';
  data: string;
  projectId: string; // To associate output with a project
  processId?: string; // Unique ID for the process being run
}

export interface ProcessTermination {
  projectId: string;
  processId?: string;
  code: number | null;
  error?: Error;
}

// Store running processes
const runningProcesses: Map<string, ChildProcess> = new Map();

export function executeCommand(
  projectId: string,
  command: string,
  args: string[],
  cwd: string, // Working directory for the command
  onOutput: (output: ProcessOutput) => void,
  onClose: (termination: ProcessTermination) => void
): { success: boolean; processId?: string; error?: string } {
  try {
    console.log(`Executing command for project ${projectId}: ${command} ${args.join(' ')} in ${cwd}`);
    
    // Ensure CWD exists
    if (!require('fs').existsSync(cwd)) {
      const errorMsg = `Working directory ${cwd} does not exist.`;
      onOutput({ projectId, type: 'stderr', data: errorMsg });
      onClose({ projectId, code: -1, error: new Error(errorMsg) });
      return { success: false, error: errorMsg };
    }

    const child = spawn(command, args, { cwd, shell: true }); // shell: true for complex commands, adjust if needed
    const processId = `${projectId}-${child.pid}`; // Create a unique ID
    runningProcesses.set(processId, child);

    onOutput({ projectId, processId, type: 'system', data: `Process started with PID: ${child.pid} (${processId})` });

    child.stdout?.on('data', (data) => {
      onOutput({ projectId, processId, type: 'stdout', data: data.toString() });
    });

    child.stderr?.on('data', (data) => {
      onOutput({ projectId, processId, type: 'stderr', data: data.toString() });
    });

    child.on('error', (error) => {
      onOutput({ projectId, processId, type: 'stderr', data: `Process error: ${error.message}` });
      // onClose will also be triggered, or handle it here if 'close' doesn't always fire after 'error'
    });
    
    child.on('close', (code) => {
      onOutput({ projectId, processId, type: 'system', data: `Process exited with code: ${code}` });
      runningProcesses.delete(processId);
      onClose({ projectId, processId, code });
    });
    
    return { success: true, processId };

  } catch (error: any) {
    console.error(`Failed to spawn command for project ${projectId}: ${error.message}`);
    onOutput({ projectId, type: 'stderr', data: `Failed to start process: ${error.message}` });
    onClose({ projectId, code: -1, error });
    return { success: false, error: error.message };
  }
}

export function killProcess(processId: string): boolean {
  const processToKill = runningProcesses.get(processId); // Renamed to avoid conflict with global 'process'
  if (processToKill) {
    console.log(`Attempting to kill process ${processId} (PID: ${processToKill.pid})`);
    // process.kill('SIGTERM'); // or 'SIGKILL' if SIGTERM is not enough
    // For cross-platform compatibility, especially on Windows, taskkill might be more reliable for child processes spawned with shell:true
    if (processToKill.pid) {
        try {
            if (process.platform === 'win32') { // Corrected: child.platform is not a thing, using global process.platform
                spawn('taskkill', ['/pid', processToKill.pid.toString(), '/f', '/t']);
            } else {
                processToKill.kill('SIGKILL'); // More forceful, ensure it stops
            }
            runningProcesses.delete(processId);
            return true;
        } catch (e:any) {
            console.error(`Error killing process ${processId}: ${e.message}`);
            return false;
        }
    }
    return false; // No PID
  }
  console.log(`Process ${processId} not found or already terminated.`);
  return false; // Process not found
}
