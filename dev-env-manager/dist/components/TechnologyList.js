"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const TechnologyListItem_1 = __importDefault(require("./TechnologyListItem"));
const TechnologyList = ({ technologies }) => {
    if (technologies.length === 0) {
        return (0, jsx_runtime_1.jsx)("p", { children: "No technologies configured yet." });
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: technologies.map(tech => ((0, jsx_runtime_1.jsx)(TechnologyListItem_1.default, { technology: tech }, tech.id))) }));
};
exports.default = TechnologyList;
