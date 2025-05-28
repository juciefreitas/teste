"use strict";
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
const jsx_runtime_1 = require("react/jsx-runtime");
// src/App.tsx
const react_1 = require("react");
const MainLayout_1 = __importDefault(require("./components/Layout/MainLayout"));
const ProjectDashboardPage_1 = __importDefault(require("./features/ProjectDashboard/ProjectDashboardPage"));
const ConsoleOutput_1 = __importDefault(require("./features/ConsoleView/ConsoleOutput"));
function App() {
    const [version, setVersion] = (0, react_1.useState)('Loading...');
    const [toolsPath, setToolsPath] = (0, react_1.useState)('Loading tools path...');
    const [consoleMessages, setConsoleMessages] = (0, react_1.useState)([]);
    // Consistent way to add messages to the console
    const addConsoleMessage = (0, react_1.useCallback)((text, type = 'system', projectId, processId) => {
        setConsoleMessages(prev => [
            ...prev,
            { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), timestamp: new Date(), text, type, projectId, processId }
        ]);
    }, []);
    const clearConsoleMessages = (0, react_1.useCallback)(() => {
        setConsoleMessages([
            // Optionally, keep initial system messages or add a "Console Cleared" message
            { id: Date.now().toString(), timestamp: new Date(), text: "Console cleared by user.", type: 'system' }
        ]);
    }, []);
    (0, react_1.useEffect)(() => {
        addConsoleMessage(`Dev Env Manager Initializing...`, 'system');
        const fetchData = () => __awaiter(this, void 0, void 0, function* () {
            if (window.electronAPI) {
                try {
                    const appVersion = yield window.electronAPI.getVersion();
                    setVersion(appVersion);
                    addConsoleMessage(`App Version: ${appVersion}`, 'system');
                    const currentToolsPath = yield window.electronAPI.getToolsDirectory();
                    setToolsPath(currentToolsPath);
                    addConsoleMessage(`Tools Directory: ${currentToolsPath}`, 'system');
                }
                catch (error) {
                    addConsoleMessage(`Error fetching initial app data: ${error.message}`, 'stderr');
                }
            }
        });
        fetchData();
        // Listener for Auto Update Status
        const removeUpdateListener = window.electronAPI.onUpdateStatus((_event, status) => {
            addConsoleMessage(`Update Status: ${status.msg}`, status.error ? 'stderr' : 'system');
            if (status.downloaded) {
                addConsoleMessage('Update downloaded. Click "Quit and Install Update" in the header.', 'system');
            }
        });
        // Listener for Process Output
        const removeProcessOutputListener = window.electronAPI.onProcessOutput((_event, output) => {
            addConsoleMessage(output.data, output.type, output.projectId, output.processId);
        });
        // Listener for Process Termination
        const removeProcessTerminationListener = window.electronAPI.onProcessTermination((_event, term) => {
            var _a;
            let message = `Process ${term.processId || ''} for project ${term.projectId} exited`;
            if (term.code !== null)
                message += ` with code: ${term.code}`;
            // Error might not be an Error object if it's just a message from main process
            const errorMessage = typeof term.error === 'string' ? term.error : (((_a = term.error) === null || _a === void 0 ? void 0 : _a.message) || '');
            if (errorMessage)
                message += ` (Error: ${errorMessage})`;
            addConsoleMessage(message, term.code === 0 ? 'system' : 'stderr', term.projectId, term.processId);
        });
        return () => {
            if (removeUpdateListener)
                removeUpdateListener();
            if (removeProcessOutputListener)
                removeProcessOutputListener();
            if (removeProcessTerminationListener)
                removeProcessTerminationListener();
        };
    }, [addConsoleMessage]); // addConsoleMessage is now a dependency
    return ((0, jsx_runtime_1.jsx)(MainLayout_1.default, { consoleSlot: (isExpanded, toggleExpand) => ( // consoleSlot is now a function
        (0, jsx_runtime_1.jsx)(ConsoleOutput_1.default, { messages: consoleMessages, height: "100%", isExpanded: isExpanded, onToggleExpand: toggleExpand, onClearConsole: clearConsoleMessages })), children: (0, jsx_runtime_1.jsx)(ProjectDashboardPage_1.default, { addConsoleMessage: addConsoleMessage }) }));
}
exports.default = App;
