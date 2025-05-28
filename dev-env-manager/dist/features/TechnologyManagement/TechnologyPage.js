"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const mockData_1 = require("../../config/mockData");
const TechnologyList_1 = __importDefault(require("../../components/TechnologyList"));
const TechnologyPage = () => {
    const [technologies, setTechnologies] = (0, react_1.useState)(mockData_1.mockTechnologies);
    // Placeholder for form state
    const [newTechName, setNewTechName] = (0, react_1.useState)('');
    const [newTechVersion, setNewTechVersion] = (0, react_1.useState)('');
    const [newTechUrl, setNewTechUrl] = (0, react_1.useState)('');
    const handleAddTechnology = (e) => {
        e.preventDefault();
        alert(`Add Tech: ${newTechName}, ${newTechVersion}, ${newTechUrl} (Not implemented)`);
        // Actual logic will be added later
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Technology Stack Management" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddTechnology, style: { marginBottom: '20px', padding: '10px', border: '1px solid #eee' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add New Technology (Placeholder)" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Name: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newTechName, onChange: e => setNewTechName(e.target.value), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("label", { children: "Version: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newTechVersion, onChange: e => setNewTechVersion(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("label", { children: "Download URL: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newTechUrl, onChange: e => setNewTechUrl(e.target.value) })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", style: { marginTop: '10px' }, children: "Add Technology" })] }), (0, jsx_runtime_1.jsx)(TechnologyList_1.default, { technologies: technologies })] }));
};
exports.default = TechnologyPage;
