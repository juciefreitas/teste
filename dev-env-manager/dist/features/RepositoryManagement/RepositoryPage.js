"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const mockData_1 = require("../../config/mockData");
const RepositoryList_1 = __importDefault(require("../../components/RepositoryList"));
const RepositoryPage = () => {
    const [repositories, setRepositories] = (0, react_1.useState)(mockData_1.mockRepositories);
    // Placeholder for form state
    const [newRepoName, setNewRepoName] = (0, react_1.useState)('');
    const [newRepoUrl, setNewRepoUrl] = (0, react_1.useState)('');
    const [newRepoBranch, setNewRepoBranch] = (0, react_1.useState)('');
    const handleAddRepository = (e) => {
        e.preventDefault();
        alert(`Add Repo: ${newRepoName}, ${newRepoUrl}, ${newRepoBranch} (Not implemented)`);
        // Actual logic will be added later
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Repository Management" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleAddRepository, style: { marginBottom: '20px', padding: '10px', border: '1px solid #eee' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add New Repository (Placeholder)" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Name: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newRepoName, onChange: e => setNewRepoName(e.target.value), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("label", { children: "Git URL: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newRepoUrl, onChange: e => setNewRepoUrl(e.target.value), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("label", { children: "Branch: " }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newRepoBranch, onChange: e => setNewRepoBranch(e.target.value), required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", style: { marginTop: '10px' }, children: "Add Repository" })] }), (0, jsx_runtime_1.jsx)(RepositoryList_1.default, { repositories: repositories })] }));
};
exports.default = RepositoryPage;
