"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const RepositoryListItem_1 = __importDefault(require("./RepositoryListItem"));
const RepositoryList = ({ repositories }) => {
    if (repositories.length === 0) {
        return (0, jsx_runtime_1.jsx)("p", { children: "No repositories configured yet." });
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: repositories.map(repo => ((0, jsx_runtime_1.jsx)(RepositoryListItem_1.default, { repository: repo }, repo.id))) }));
};
exports.default = RepositoryList;
