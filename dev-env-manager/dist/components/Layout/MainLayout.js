"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/components/Layout/MainLayout.tsx
const react_1 = require("react");
const core_1 = require("@mantine/core");
const core_2 = require("@mantine/core");
const DEFAULT_CONSOLE_HEIGHT = 200;
const EXPANDED_CONSOLE_HEIGHT = 400; // Or a larger portion of viewport
const MainLayout = ({ children, consoleSlot }) => {
    const { colorScheme, toggleColorScheme } = (0, core_2.useMantineColorScheme)();
    const theme = (0, core_1.useMantineTheme)();
    const [isConsoleExpanded, setIsConsoleExpanded] = (0, react_1.useState)(false);
    const toggleConsoleExpand = () => setIsConsoleExpanded(prev => !prev);
    const currentConsoleHeight = isConsoleExpanded ? EXPANDED_CONSOLE_HEIGHT : DEFAULT_CONSOLE_HEIGHT;
    return ((0, jsx_runtime_1.jsx)(core_1.AppShell, { padding: "md", header: (0, jsx_runtime_1.jsx)(core_1.Header, { height: 60, p: "md", children: (0, jsx_runtime_1.jsxs)(core_1.Group, { position: "apart", sx: { height: '100%' }, children: [(0, jsx_runtime_1.jsx)(core_1.Text, { size: "xl", weight: 700, children: "Dev Env Manager" }), (0, jsx_runtime_1.jsxs)(core_1.Button, { onClick: () => toggleColorScheme(), variant: "outline", size: "sm", children: [colorScheme === 'dark' ? 'Light' : 'Dark', " Mode"] })] }) }), footer: 
        // Pass isExpanded and toggleConsoleExpand to the consoleSlot renderer
        consoleSlot ? ((0, jsx_runtime_1.jsx)(core_1.Footer, { height: currentConsoleHeight, p: 0, style: { borderTop: `1px solid ${theme.colors.gray[3]}` }, children: consoleSlot(isConsoleExpanded, toggleConsoleExpand) })) : undefined, styles: (th) => ({
            main: {
                backgroundColor: th.colorScheme === 'dark' ? th.colors.dark[8] : th.colors.gray[0],
                // Adjust main area height based on console visibility and height
                minHeight: `calc(100vh - 60px - ${consoleSlot ? currentConsoleHeight : 0}px)`,
                paddingBottom: consoleSlot ? currentConsoleHeight + 16 : 0, // Ensure space if footer is present
            },
        }), children: children }));
};
exports.default = MainLayout;
