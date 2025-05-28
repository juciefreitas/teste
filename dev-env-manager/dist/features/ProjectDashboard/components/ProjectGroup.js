"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ProjectListItem_1 = __importDefault(require("./ProjectListItem"));
const core_1 = require("@mantine/core");
const ProjectGroup = ({ groupName, projects, onProjectUpdate, addConsoleMessage }) => {
    return ((0, jsx_runtime_1.jsx)(core_1.Accordion, { defaultValue: groupName, mb: "md", children: (0, jsx_runtime_1.jsxs)(core_1.Accordion.Item, { value: groupName, children: [(0, jsx_runtime_1.jsx)(core_1.Accordion.Control, { children: (0, jsx_runtime_1.jsxs)(core_1.Text, { weight: 500, size: "xl", children: [groupName, " (", projects.length, ")"] }) }), (0, jsx_runtime_1.jsx)(core_1.Accordion.Panel, { children: projects.map(project => ((0, jsx_runtime_1.jsx)(ProjectListItem_1.default, { project: project, onProjectUpdate: onProjectUpdate, addConsoleMessage: addConsoleMessage }, project.id))) })] }) }));
};
exports.default = ProjectGroup;
