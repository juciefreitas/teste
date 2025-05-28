"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/features/ProjectDashboard/ProjectDashboardPage.tsx
const react_1 = __importDefault(require("react")); // Ensure React is imported
const mockData_1 = require("../../config/mockData");
const ProjectGroup_1 = __importDefault(require("./components/ProjectGroup"));
const core_1 = require("@mantine/core");
const icons_react_1 = require("@tabler/icons-react");
const ProjectDashboardPage = ({ addConsoleMessage }) => {
    const [projects, setProjects] = react_1.default.useState(mockData_1.mockProjects);
    const handleProjectUpdate = (updatedProjectPart) => {
        setProjects(prevProjects => prevProjects.map(p => p.id === updatedProjectPart.id ? Object.assign(Object.assign({}, p), updatedProjectPart) : p));
    };
    const groupedProjects = projects.reduce((acc, project) => {
        const group = project.group || 'Uncategorized';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(project);
        return acc;
    }, {});
    return ((0, jsx_runtime_1.jsxs)(core_1.Container, { fluid: true, children: [(0, jsx_runtime_1.jsxs)(core_1.Group, { position: "apart", mb: "xl", children: [(0, jsx_runtime_1.jsx)(core_1.Title, { order: 2, children: "Project Dashboard" }), (0, jsx_runtime_1.jsx)(core_1.Button, { leftIcon: (0, jsx_runtime_1.jsx)(icons_react_1.IconPlus, { size: 14 }), onClick: () => alert('Add New Project (NI)'), children: "Add Project" })] }), Object.entries(groupedProjects).map(([groupName, projectList]) => ((0, jsx_runtime_1.jsx)(ProjectGroup_1.default, { groupName: groupName, projects: projectList, onProjectUpdate: handleProjectUpdate, addConsoleMessage: addConsoleMessage }, groupName)))] }));
};
exports.default = ProjectDashboardPage;
