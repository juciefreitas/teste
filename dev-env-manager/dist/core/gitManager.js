"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCloningBaseDir = void 0;
exports.cloneRepository = cloneRepository;
exports.pullRepository = pullRepository;
exports.getRepoStatus = getRepoStatus;
// src/core/gitManager.ts
const simple_git_1 = __importDefault(require("simple-git"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path")); // Ensure path is imported
const getProjectCloningBaseDir = (electronApp) => {
    const baseDir = path.join(electronApp.getPath('userData'), 'cloned_projects');
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
};
exports.getProjectCloningBaseDir = getProjectCloningBaseDir;
const createGitInstance = (basePath) => {
    const options = {
        baseDir: basePath,
        binary: 'git',
        maxConcurrentProcesses: 6,
    };
    return (0, simple_git_1.default)(options);
};
function cloneRepository(repoUrl, targetDirectoryName, cloningBaseDir, progressCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const localPath = path.join(cloningBaseDir, targetDirectoryName);
        if (fs.existsSync(localPath)) {
            try {
                const git = createGitInstance(localPath);
                if (yield git.checkIsRepo()) {
                    return { path: localPath, success: true, error: 'Directory already exists and is a git repository.' };
                }
                else {
                    return { path: localPath, success: false, error: 'Directory already exists but is not a git repository.' };
                }
            }
            catch (err) {
                return { path: localPath, success: false, error: `Directory check failed: ${err.message}` };
            }
        }
        // Intentionally not using createGitInstance(cloningBaseDir) here because spawn needs cwd
        // const git = createGitInstance(cloningBaseDir); 
        try {
            console.log(`Cloning ${repoUrl} into ${localPath}...`);
            progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'cloning', progress: 0, processed: 0, total: 100, message: 'Clone initiated' });
            // Using a direct spawn approach for better progress for clone
            // as simple-git's built-in clone progress is limited.
            const { spawn } = yield Promise.resolve().then(() => __importStar(require('child_process')));
            const child = spawn('git', ['clone', repoUrl, targetDirectoryName, '--progress'], { cwd: cloningBaseDir, stdio: ['ignore', 'pipe', 'pipe'], shell: true });
            let cloneError = '';
            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                // Git clone --progress often sends to stderr, but some messages might be on stdout
                // console.log(`Clone stdout: ${data}`);
            });
            (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                const message = data.toString();
                // console.log(`Clone stderr: ${message}`); // For debugging
                // Try to parse progress from stderr
                // Example: "Cloning into 'targetDirectoryName'...
                // Receiving objects:  1% (1/100)"
                const progressMatch = message.match(/Receiving objects:\s*(\d+)%\s*\((\d+)\/(\d+)\)/) || message.match(/Resolving deltas:\s*(\d+)%\s*\((\d+)\/(\d+)\)/);
                if (progressMatch) {
                    progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({
                        phase: message.includes('Receiving') ? 'receiving' : 'resolving',
                        progress: parseInt(progressMatch[1], 10),
                        processed: parseInt(progressMatch[2], 10),
                        total: parseInt(progressMatch[3], 10),
                    });
                }
                else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fatal')) {
                    cloneError += message;
                }
            });
            return new Promise((resolve, reject) => {
                child.on('close', (code) => {
                    if (code === 0) {
                        progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'cloning', progress: 100, processed: 100, total: 100, message: 'Clone completed' });
                        console.log(`Successfully cloned ${repoUrl} to ${localPath}`);
                        resolve({ path: localPath, success: true });
                    }
                    else {
                        const errorMsg = cloneError || `Git clone process exited with code ${code}`;
                        console.error(`Failed to clone ${repoUrl}: ${errorMsg}`);
                        progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'cloning', progress: 100, processed: 0, total: 100, message: `Error: ${errorMsg}` });
                        // IMPORTANT: Resolve with failure, do not reject for IPC to work as expected with invoke
                        resolve({ path: localPath, success: false, error: errorMsg });
                    }
                });
                child.on('error', (err) => {
                    console.error(`Spawn error during clone: ${err.message}`);
                    progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'cloning', progress: 100, processed: 0, total: 100, message: `Spawn Error: ${err.message}` });
                    // IMPORTANT: Resolve with failure
                    resolve({ path: localPath, success: false, error: `Spawn error: ${err.message}` });
                });
            });
        }
        catch (error) { // Catch errors from setup, not from spawn itself here
            console.error(`Setup error for clone ${repoUrl}: ${error.message}`);
            progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'cloning', progress: 100, processed: 0, total: 100, message: `Error: ${error.message}` });
            return { path: localPath, success: false, error: error.message };
        }
    });
}
function pullRepository(repoPath, progressCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            return { success: false, error: 'Repository path does not exist or is not a directory.' };
        }
        const git = createGitInstance(repoPath);
        if (!(yield git.checkIsRepo())) {
            return { success: false, error: 'Not a git repository at the specified path.' };
        }
        try {
            console.log(`Pulling repository at ${repoPath}...`);
            git.outputHandler((_command, stdout, stderr) => {
                const processOutput = (data, type) => {
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
                    }
                    else if (type === 'stderr' && text.trim().length > 0 && progressCallback) {
                        // Send other significant stderr messages
                        // progressCallback({ phase: 'info', progress: 0, processed: 0, total: 0, message: text.trim() });
                    }
                };
                stdout.on('data', data => processOutput(data, 'stdout'));
                stderr.on('data', data => processOutput(data, 'stderr'));
            });
            progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'pull', progress: 0, processed: 0, total: 0, message: 'Pull initiated' });
            const summary = yield git.pull(['--progress']);
            console.log('Pull successful.', summary);
            progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'pull', progress: 100, processed: ((_a = summary.files) === null || _a === void 0 ? void 0 : _a.length) || 0, total: ((_b = summary.files) === null || _b === void 0 ? void 0 : _b.length) || 0, message: 'Pull completed' });
            return { success: true, summary };
        }
        catch (error) {
            console.error(`Failed to pull repository at ${repoPath}: ${error.message}`);
            progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback({ phase: 'pull', progress: 100, message: `Error: ${error.message}`, processed: 0, total: 0 });
            return { success: false, error: error.message };
        }
    });
}
function getRepoStatus(repoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            return { error: 'Repository path does not exist or is not a directory.' };
        }
        const git = createGitInstance(repoPath);
        if (!(yield git.checkIsRepo())) {
            return { error: 'Not a git repository.' };
        }
        try {
            const status = yield git.status();
            return status;
        }
        catch (error) {
            return { error: error.message };
        }
    });
}
