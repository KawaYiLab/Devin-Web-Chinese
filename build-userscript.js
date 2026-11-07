/** 合并完整源码，保留各自作用域；无需猜测 IIFE 的行号或换行格式。 */
const fs = require("node:fs");
const path = require("node:path");
const { Script } = require("node:vm");
const manifest = require("./extension/manifest.json");

function buildUserscript() {
  const header = [
    "// ==UserScript==",
    "// @name         Devin 网页端汉化",
    "// @namespace    https://github.com/KawaYiLab/Devin-Web-Chinese",
    "// @version      " + manifest.version,
    "// @description  " + manifest.description,
    "// @author       KawaYiLab",
    ...manifest.content_scripts[0].matches.map((match) => "// @match        " + match),
    "// @grant        none",
    "// @run-at       document-idle",
    "// @noframes",
    "// @license      MIT",
    "// @homepageURL  https://github.com/KawaYiLab/Devin-Web-Chinese",
    "// @supportURL   https://github.com/KawaYiLab/Devin-Web-Chinese/issues",
    "// ==/UserScript==",
  ].join("\n");
  const sources = manifest.content_scripts[0].js.map((file) =>
    fs.readFileSync(path.join(__dirname, "extension", file), "utf8").replace(/\r\n?/g, "\n").trimEnd());
  const output = header + '\n\n(function () {\n  "use strict";\n\n' + sources.join("\n\n") + "\n})();\n";
  new Script(output, { filename: "devin-chinese.user.js" });
  return output;
}

if (require.main === module) {
  const destination = path.join(__dirname, "devin-chinese.user.js");
  const output = buildUserscript();
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8").replace(/\r\n?/g, "\n") !== output) {
      console.error("油猴脚本与源码不同步，请运行 npm run build。");
      process.exitCode = 1;
    } else console.log("油猴脚本与扩展源码一致。");
  } else {
    fs.writeFileSync(destination, output);
    console.log("已构建 devin-chinese.user.js (" + manifest.version + ")");
  }
}
module.exports = { buildUserscript };
