"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const core_1 = require("@mantine/core"); // Import Mantine components
const App_1 = __importDefault(require("./App"));
require("./index.css");
function Root() {
    const [colorScheme, setColorScheme] = react_1.default.useState('light'); // Default to light
    const toggleColorScheme = (value) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
    return ((0, jsx_runtime_1.jsx)(core_1.ColorSchemeProvider, { colorScheme: colorScheme, toggleColorScheme: toggleColorScheme, children: (0, jsx_runtime_1.jsx)(core_1.MantineProvider, { theme: { colorScheme }, withGlobalStyles: true, withNormalizeCSS: true, children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }) }));
}
client_1.default.createRoot(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(Root, {}) }));
