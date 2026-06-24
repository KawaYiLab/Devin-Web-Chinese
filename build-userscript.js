/**
 * 构建油猴脚本
 * 将 extension/dictionary.js 和 extension/content.js 合并为单文件 devin-chinese.user.js
 *
 * 用法: node build-userscript.js
 */

const fs = require('fs');
const path = require('path');

const HEADER = `// ==UserScript==
// @name         Devin 网页端汉化
// @namespace    https://github.com/Fangpidifferentiate/Devin-Web-Chinese
// @version      1.0.0
// @description  将 Devin (app.devin.ai) 网页界面全面汉化为中文，基于静态词典映射 + 正则规则
// @author       FangpiDifferentiate
// @match        https://app.devin.ai/*
// @match        https://*.devin.ai/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/Fangpidifferentiate/Devin-Web-Chinese
// @supportURL   https://github.com/Fangpidifferentiate/Devin-Web-Chinese/issues
// ==/UserScript==

`;

const dict = fs.readFileSync(path.join(__dirname, 'extension/dictionary.js'), 'utf8');
const content = fs.readFileSync(path.join(__dirname, 'extension/content.js'), 'utf8');

// Remove comment headers from dictionary
const dictBody = dict
  .replace(/^\/\*\*[\s\S]*?\*\/\n\n/, '')
  .replace('// eslint-disable-next-line no-unused-vars\n', '')
  .replace('// eslint-disable-next-line no-unused-vars\n', '');

// Extract content.js inner logic (remove IIFE wrapper and "use strict")
const contentLines = content.split('\n');
// Find the IIFE closing line `})();` and exclude it and everything after
const iifeCloseIdx = contentLines.lastIndexOf('})();');
// Start at index 13 (after: 0-9 comment, 10 IIFE open, 11 "use strict", 12 blank)
const innerLogic = contentLines.slice(13, iifeCloseIdx).join('\n');

// Assemble
const userscript = HEADER + '(function () {\n  "use strict";\n\n' + dictBody + '\n' + innerLogic + '\n})();\n';

fs.writeFileSync(path.join(__dirname, 'devin-chinese.user.js'), userscript);
console.log('Built devin-chinese.user.js (' + userscript.split('\n').length + ' lines)');
