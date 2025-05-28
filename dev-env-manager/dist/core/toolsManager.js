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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolsDirectoryPath = getToolsDirectoryPath;
exports.getSpecificToolPath = getSpecificToolPath;
const electron_1 = require("electron"); // Requires running in main process or using ipc
const path = __importStar(require("path"));
const fs = __importStar(require("fs")); // Node's File System module
// This function should ideally be called from the main process
// or its result passed to the renderer via IPC if needed there.
function getToolsDirectoryPath() {
    // app.getPath('userData') is the standard place for app-specific data.
    // We'll create a 'portable-tools' subdirectory within it.
    const userDataPath = electron_1.app.getPath('userData');
    const toolsPath = path.join(userDataPath, 'portable-tools');
    // Ensure the directory exists
    if (!fs.existsSync(toolsPath)) {
        fs.mkdirSync(toolsPath, { recursive: true });
    }
    return toolsPath;
}
// Example of how you might want to get a specific tool's path
function getSpecificToolPath(toolName, version) {
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
