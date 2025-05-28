"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const RepositoryListItem = ({ repository }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: repository.name }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "URL:" }), " ", repository.gitUrl] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Branch:" }), " ", repository.branch] }), repository.group && (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Group:" }), " ", repository.group] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => alert('Edit ' + repository.name), children: "Edit" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => alert('Delete ' + repository.name), style: { marginLeft: '5px' }, children: "Delete" })] }));
};
exports.default = RepositoryListItem;
