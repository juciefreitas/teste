"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/features/ConsoleView/ConsoleOutput.tsx
const react_1 = require("react"); // Removed useState as messages come from props
const core_1 = require("@mantine/core"); // Added Code, Tooltip
const icons_react_1 = require("@tabler/icons-react");
const ConsoleOutput = ({ messages, height = '100%', isExpanded, onToggleExpand, onClearConsole }) => {
    const theme = (0, core_1.useMantineTheme)();
    const scrollAreaViewport = (0, react_1.useRef)(null);
    // Auto-scroll to bottom
    (0, react_1.useEffect)(() => {
        if (scrollAreaViewport.current) {
            scrollAreaViewport.current.scrollTo({ top: scrollAreaViewport.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    const getMessageColor = (type) => {
        if (type === 'stderr')
            return theme.colors.red[7];
        if (type === 'system')
            return theme.colors.blue[6];
        if (type === 'git')
            return theme.colors.grape[6]; // Example color for Git messages
        // stdout and other types
        return theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[7];
    };
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    return ((0, jsx_runtime_1.jsxs)(core_1.Box, { sx: { display: 'flex', flexDirection: 'column', height: height }, children: [(0, jsx_runtime_1.jsxs)(core_1.Group, { position: "apart", p: "xs", sx: (th) => ({ backgroundColor: th.colorScheme === 'dark' ? th.colors.dark[6] : th.colors.gray[1], borderBottom: `1px solid ${th.colorScheme === 'dark' ? th.colors.dark[4] : th.colors.gray[3]}` }), children: [(0, jsx_runtime_1.jsx)(core_1.Text, { size: "sm", weight: 500, children: "Console" }), (0, jsx_runtime_1.jsxs)(core_1.Group, { spacing: "xs", children: [onToggleExpand && ((0, jsx_runtime_1.jsx)(core_1.Tooltip, { label: isExpanded ? "Minimize Console" : "Maximize Console", children: (0, jsx_runtime_1.jsx)(core_1.Button, { variant: "default", size: "xs", onClick: onToggleExpand, px: 6, children: isExpanded ? (0, jsx_runtime_1.jsx)(icons_react_1.IconArrowsMinimize, { size: 16 }) : (0, jsx_runtime_1.jsx)(icons_react_1.IconArrowsMaximize, { size: 16 }) }) })), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { label: "Clear Console", children: (0, jsx_runtime_1.jsx)(core_1.Button, { variant: "default", size: "xs", onClick: onClearConsole, px: 6, children: (0, jsx_runtime_1.jsx)(icons_react_1.IconX, { size: 16 }) }) })] })] }), (0, jsx_runtime_1.jsxs)(core_1.ScrollArea, { viewportRef: scrollAreaViewport, style: { flexGrow: 1 }, p: "xs", bg: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white, children: [messages.length === 0 && (0, jsx_runtime_1.jsx)(core_1.Text, { size: "xs", color: "dimmed", align: "center", mt: "md", children: "Console is empty. Output from commands will appear here." }), messages.map(msg => ((0, jsx_runtime_1.jsx)(core_1.Box, { mb: 4, children: (0, jsx_runtime_1.jsxs)(core_1.Text, { size: "xs", ff: "monospace", color: getMessageColor(msg.type), children: [(0, jsx_runtime_1.jsxs)(core_1.Text, { span: true, color: theme.colors.gray[6], mr: 5, children: ["[", formatTimestamp(msg.timestamp), "]"] }), msg.projectId && (0, jsx_runtime_1.jsxs)(core_1.Text, { span: true, color: theme.colors.violet[5], mr: 5, children: ["[", msg.projectId.substring(0, 6), "]"] }), msg.processId && (0, jsx_runtime_1.jsxs)(core_1.Text, { span: true, color: theme.colors.cyan[5], mr: 5, children: ["[pid:", msg.processId.split('-').pop(), "]"] }), msg.text] }) }, msg.id)))] })] }));
};
exports.default = ConsoleOutput;
