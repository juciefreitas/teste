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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/features/ProjectDashboard/components/ProjectListItem.tsx
const react_1 = require("react");
const core_1 = require("@mantine/core");
const icons_react_1 = require("@tabler/icons-react");
const ProjectListItem = ({ project, onProjectUpdate, addConsoleMessage }) => {
    var _a, _b, _c, _d, _e, _f;
    const [gitUiFeedback, setGitUiFeedback] = (0, react_1.useState)({ message: '' });
    const [isCloningOrPulling, setIsCloningOrPulling] = (0, react_1.useState)(false);
    const [activeProcessId, setActiveProcessId] = (0, react_1.useState)(undefined);
    const statusColor = (status) => {
        switch (status) {
            case 'running': return 'green';
            case 'stopped': return 'red';
            case 'building': return 'blue';
            case 'error': return 'orange';
            case 'cloned': return 'cyan';
            case 'not_cloned': return 'gray';
            default: return 'dimmed'; // Changed 'gray' to 'dimmed' for unknown
        }
    };
    // Git operation status listener
    (0, react_1.useEffect)(() => {
        const removeListener = window.electronAPI.onGitOperationStatus(project.id, (_event, status) => {
            if (status.channel === 'progress') {
                setGitUiFeedback({ message: `[GIT ${status.phase}] ${status.message || ''}`, progressVal: status.progress });
            }
            else if (status.channel === 'result') {
                setIsCloningOrPulling(false);
                if (status.success) {
                    setGitUiFeedback({ message: `GIT: Operation successful. ${status.error || status.message || ''}`, progressVal: 100 });
                    addConsoleMessage(`GIT: ${project.name} - Operation successful. ${status.error || ''}`, 'git', project.id);
                    onProjectUpdate({ id: project.id, currentStatus: 'cloned', clonePath: status.path || project.clonePath, statusMessage: status.error || 'Ready' });
                }
                else {
                    setGitUiFeedback({ message: `GIT Error: ${status.error || 'Unknown error'}`, error: true });
                    addConsoleMessage(`GIT Error: ${project.name} - ${status.error || 'Unknown error'}`, 'stderr', project.id);
                    onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: status.error || 'Git operation failed' });
                }
            }
        });
        return removeListener;
    }, [project.id, project.name, onProjectUpdate, addConsoleMessage, project.clonePath]); // Added project.clonePath to dependency array
    const handleGitAction = () => __awaiter(void 0, void 0, void 0, function* () {
        setGitUiFeedback({ message: 'Initiating Git operation...', progressVal: 0 });
        setIsCloningOrPulling(true);
        const targetName = project.name.replace(/[^a-zA-Z0-9_-]/g, '') || project.id;
        if (project.currentStatus === 'not_cloned' || !project.clonePath /* crude check */) {
            try {
                const result = yield window.electronAPI.gitClone({
                    projectId: project.id,
                    repoUrl: project.gitUrl,
                    targetDirectoryName: targetName
                });
                if (!result.success && result.error && !result.error.includes("already exists")) {
                    setGitUiFeedback({ message: `Clone command failed to invoke: ${result.error}`, error: true });
                    setIsCloningOrPulling(false);
                    onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: result.error });
                }
            }
            catch (err) {
                setGitUiFeedback({ message: `IPC Error during clone: ${err.message}`, error: true });
                setIsCloningOrPulling(false);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
            }
        }
        else {
            if (!project.clonePath) {
                setGitUiFeedback({ message: "Error: Clone path not known for pull operation.", error: true });
                setIsCloningOrPulling(false);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: "Clone path unknown for pull." });
                return;
            }
            try {
                const result = yield window.electronAPI.gitPull({ projectId: project.id, repoPath: project.clonePath });
                if (!result.success) {
                    setGitUiFeedback({ message: `Pull command failed to invoke: ${result.error}`, error: true });
                    setIsCloningOrPulling(false);
                    onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: result.error });
                }
            }
            catch (err) {
                setGitUiFeedback({ message: `IPC Error during pull: ${err.message}`, error: true });
                setIsCloningOrPulling(false);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
            }
        }
    });
    const parseCommand = (cmdString) => {
        const parts = cmdString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        if (parts.length === 0)
            return { command: '', args: [] };
        const command = parts[0].replace(/"/g, '');
        const args = parts.slice(1).map(arg => arg.replace(/"/g, ''));
        return { command, args };
    };
    const handleExecuteCommand = (commandType) => __awaiter(void 0, void 0, void 0, function* () {
        let cmdToRun;
        if (commandType === 'build')
            cmdToRun = project.buildCmd;
        else if (commandType === 'start')
            cmdToRun = project.startCmd;
        if (!cmdToRun) {
            addConsoleMessage(`No ${commandType} command configured for ${project.name}`, 'stderr', project.id);
            return;
        }
        if (!project.clonePath) {
            addConsoleMessage(`Project path for ${project.name} is not set. Clone repository first.`, 'stderr', project.id);
            return;
        }
        const { command, args } = parseCommand(cmdToRun);
        if (!command) {
            addConsoleMessage(`Invalid ${commandType} command for ${project.name}: ${cmdToRun}`, 'stderr', project.id);
            return;
        }
        addConsoleMessage(`Executing ${commandType} for ${project.name}: ${command} ${args.join(' ')}`, 'system', project.id);
        onProjectUpdate({ id: project.id, currentStatus: commandType === 'build' ? 'building' : 'running', statusMessage: `${commandType} in progress...` });
        try {
            const result = yield window.electronAPI.executeCommand({ projectId: project.id, command, args, cwd: project.clonePath });
            if (result.success && result.processId) {
                if (commandType === 'start') {
                    setActiveProcessId(result.processId);
                }
            }
            else {
                addConsoleMessage(`Failed to start ${commandType} process for ${project.name}: ${result.error}`, 'stderr', project.id);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `Failed to start ${commandType}: ${result.error}` });
            }
        }
        catch (err) {
            addConsoleMessage(`IPC Error during ${commandType} for ${project.name}: ${err.message}`, 'stderr', project.id);
            onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
        }
    });
    const handleStopCommand = () => __awaiter(void 0, void 0, void 0, function* () {
        if (activeProcessId) {
            addConsoleMessage(`Stopping process ${activeProcessId} for ${project.name}`, 'system', project.id, activeProcessId);
            const success = yield window.electronAPI.killProcess({ processId: activeProcessId });
            if (success) {
                onProjectUpdate({ id: project.id, currentStatus: 'stopped', statusMessage: 'Stop signal sent.' });
            }
            else {
                addConsoleMessage(`Failed to send stop signal to process ${activeProcessId}. It might have already exited.`, 'stderr', project.id, activeProcessId);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: 'Failed to stop process or already stopped.' });
            }
            setActiveProcessId(undefined);
        }
        else {
            addConsoleMessage(`No active process to stop for ${project.name}.`, 'system', project.id);
            if (project.currentStatus === 'running') {
                onProjectUpdate({ id: project.id, currentStatus: 'stopped', statusMessage: 'Process was likely not running or PID lost.' });
            }
        }
    });
    (0, react_1.useEffect)(() => {
        if (project.currentStatus !== 'running' && project.currentStatus !== 'building' && activeProcessId) {
            setActiveProcessId(undefined);
        }
    }, [project.currentStatus, activeProcessId]);
    return ((0, jsx_runtime_1.jsxs)(core_1.Card, { shadow: "sm", p: "lg", radius: "md", withBorder: true, mb: "md", children: [(0, jsx_runtime_1.jsxs)(core_1.Group, { position: "apart", mb: "xs", children: [(0, jsx_runtime_1.jsxs)(core_1.Stack, { spacing: "xs", children: [(0, jsx_runtime_1.jsx)(core_1.Text, { weight: 500, size: "lg", children: project.name }), (0, jsx_runtime_1.jsxs)(core_1.Text, { size: "sm", color: "dimmed", children: ["Tech: ", project.technology || 'N/A', " (", project.techVersion || 'N/A', ") - Port: ", project.port || 'N/A'] })] }), (0, jsx_runtime_1.jsx)(core_1.Badge, { color: statusColor(project.currentStatus), variant: "light", children: project.currentStatus })] }), (gitUiFeedback.message && gitUiFeedback.message.startsWith('[GIT')) || (project.statusMessage && !gitUiFeedback.message.startsWith('[GIT')) ? ((0, jsx_runtime_1.jsxs)(Box, { my: "sm", children: [(0, jsx_runtime_1.jsx)(core_1.Text, { size: "xs", color: gitUiFeedback.error ? 'red' : (project.currentStatus === 'error' ? 'red' : 'blue'), children: gitUiFeedback.message.startsWith('[GIT') ? gitUiFeedback.message : project.statusMessage }), typeof gitUiFeedback.progressVal === 'number' && gitUiFeedback.progressVal < 100 && !gitUiFeedback.error && ((0, jsx_runtime_1.jsx)(core_1.Progress, { value: gitUiFeedback.progressVal, size: "sm", animate: isCloningOrPulling && gitUiFeedback.progressVal > 0 && gitUiFeedback.progressVal < 100 }))] })) : null, (0, jsx_runtime_1.jsx)(core_1.Divider, { my: "sm" }), (0, jsx_runtime_1.jsxs)(core_1.Group, { spacing: "xs", grow: true, children: [(0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconGitBranch, { size: 14 }), variant: "outline", size: "xs", onClick: handleGitAction, loading: isCloningOrPulling, disabled: isCloningOrPulling || project.currentStatus === 'building' || project.currentStatus === 'running', children: project.currentStatus === 'not_cloned' ? 'Clone' : 'Pull' }), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { label: project.buildCmd || "No build command", disabled: !!project.buildCmd, children: (0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconTools, { size: 14 }), variant: "outline", size: "xs", onClick: () => handleExecuteCommand('build'), disabled: !project.buildCmd || project.currentStatus === 'building' || project.currentStatus === 'running' || project.currentStatus === 'not_cloned', children: "Build" }) }), project.currentStatus === 'running' ? ((0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconPlayerStop, { size: 14 }), variant: "filled", color: "red", size: "xs", onClick: handleStopCommand, disabled: !activeProcessId, children: "Stop" })) : ((0, jsx_runtime_1.jsx)(core_1.Tooltip, { label: project.startCmd || "No start command", disabled: !!project.startCmd, children: (0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconPlayerPlay, { size: 14 }), variant: "outline", size: "xs", onClick: () => handleExecuteCommand('start'), disabled: !project.startCmd || project.currentStatus === 'building' || project.currentStatus === 'running' || project.currentStatus === 'not_cloned', children: "Start" }) })), (0, jsx_runtime_1.jsxs)(core_1.Menu, { shadow: "md", width: 200, children: [(0, jsx_runtime_1.jsx)(core_1.Menu.Target, { children: (0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconSettings, { size: 14 }), variant: "outline", size: "xs", children: "Config" }) }), (0, jsx_runtime_1.jsxs)(core_1.Menu.Dropdown, { children: [(0, jsx_runtime_1.jsx)(core_1.Menu.Item, { disabled: true, children: "View/Edit (NI)" }), project.configNotes && (0, jsx_runtime_1.jsx)(core_1.Menu.Item, { disabled: true, children: (0, jsx_runtime_1.jsxs)(core_1.Text, { truncate: true, children: ["Notes: ", project.configNotes] }) })] })] })] }), (0, jsx_runtime_1.jsx)(core_1.Space, { h: "xs" }), (0, jsx_runtime_1.jsxs)(core_1.Group, { spacing: "xs", grow: true, children: [(0, jsx_runtime_1.jsxs)(core_1.Menu, { shadow: "md", width: 200, children: [(0, jsx_runtime_1.jsx)(core_1.Menu.Target, { children: (0, jsx_runtime_1.jsx)(core_1.Button, { variant: "subtle", size: "xs", rightIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconChevronDown, { size: 14 }), children: "Environments" }) }), (0, jsx_runtime_1.jsx)(core_1.Menu.Dropdown, { children: (_b = (_a = project.environments) === null || _a === void 0 ? void 0 : _a.map(env => (0, jsx_runtime_1.jsxs)(core_1.Menu.Item, { disabled: true, children: [env.name, " ", env.isActive ? '(Active)' : ''] }, env.id))) !== null && _b !== void 0 ? _b : (0, jsx_runtime_1.jsx)(core_1.Menu.Item, { disabled: true, children: "None" }) })] }), (0, jsx_runtime_1.jsxs)(core_1.Menu, { shadow: "md", width: 200, children: [(0, jsx_runtime_1.jsx)(core_1.Menu.Target, { children: (0, jsx_runtime_1.jsx)(core_1.Button, { variant: "subtle", size: "xs", rightIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconChevronDown, { size: 14 }), children: "Links" }) }), (0, jsx_runtime_1.jsx)(core_1.Menu.Dropdown, { children: (_d = (_c = project.links) === null || _c === void 0 ? void 0 : _c.map(link => (0, jsx_runtime_1.jsx)(core_1.Menu.Item, { component: "a", href: link.url, target: "_blank", children: link.title }, link.id))) !== null && _d !== void 0 ? _d : (0, jsx_runtime_1.jsx)(core_1.Menu.Item, { disabled: true, children: "None" }) })] }), (0, jsx_runtime_1.jsxs)(core_1.Menu, { shadow: "md", width: 200, children: [(0, jsx_runtime_1.jsx)(core_1.Menu.Target, { children: (0, jsx_runtime_1.jsx)(core_1.Button, { variant: "subtle", size: "xs", rightIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconChevronDown, { size: 14 }), children: "Logs" }) }), (0, jsx_runtime_1.jsx)(core_1.Menu.Dropdown, { children: (_f = (_e = project.logConfigs) === null || _e === void 0 ? void 0 : _e.map(log => (0, jsx_runtime_1.jsxs)(core_1.Menu.Item, { disabled: true, children: [log.title, " (NI)"] }, log.id))) !== null && _f !== void 0 ? _f : (0, jsx_runtime_1.jsx)(core_1.Menu.Item, { disabled: true, children: "None" }) })] })] })] }));
};
exports.default = ProjectListItem;
