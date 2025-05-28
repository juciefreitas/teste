"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
exports.killProcess = killProcess;
// src/core/processManager.ts
const child_process_1 = require("child_process");
// Store running processes
const runningProcesses = new Map();
function executeCommand(projectId, command, args, cwd, // Working directory for the command
onOutput, onClose) {
    var _a, _b;
    try {
        console.log(`Executing command for project ${projectId}: ${command} ${args.join(' ')} in ${cwd}`);
        // Ensure CWD exists
        if (!require('fs').existsSync(cwd)) {
            const errorMsg = `Working directory ${cwd} does not exist.`;
            onOutput({ projectId, type: 'stderr', data: errorMsg });
            onClose({ projectId, code: -1, error: new Error(errorMsg) });
            return { success: false, error: errorMsg };
        }
        const child = (0, child_process_1.spawn)(command, args, { cwd, shell: true }); // shell: true for complex commands, adjust if needed
        const processId = `${projectId}-${child.pid}`; // Create a unique ID
        runningProcesses.set(processId, child);
        onOutput({ projectId, processId, type: 'system', data: `Process started with PID: ${child.pid} (${processId})` });
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            onOutput({ projectId, processId, type: 'stdout', data: data.toString() });
        });
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
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
    }
    catch (error) {
        console.error(`Failed to spawn command for project ${projectId}: ${error.message}`);
        onOutput({ projectId, type: 'stderr', data: `Failed to start process: ${error.message}` });
        onClose({ projectId, code: -1, error });
        return { success: false, error: error.message };
    }
}
function killProcess(processId) {
    const processToKill = runningProcesses.get(processId); // Renamed to avoid conflict with global 'process'
    if (processToKill) {
        console.log(`Attempting to kill process ${processId} (PID: ${processToKill.pid})`);
        // process.kill('SIGTERM'); // or 'SIGKILL' if SIGTERM is not enough
        // For cross-platform compatibility, especially on Windows, taskkill might be more reliable for child processes spawned with shell:true
        if (processToKill.pid) {
            try {
                if (process.platform === 'win32') { // Corrected: child.platform is not a thing, using global process.platform
                    (0, child_process_1.spawn)('taskkill', ['/pid', processToKill.pid.toString(), '/f', '/t']);
                }
                else {
                    processToKill.kill('SIGKILL'); // More forceful, ensure it stops
                }
                runningProcesses.delete(processId);
                return true;
            }
            catch (e) {
                console.error(`Error killing process ${processId}: ${e.message}`);
                return false;
            }
        }
        return false; // No PID
    }
    console.log(`Process ${processId} not found or already terminated.`);
    return false; // Process not found
}
