const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const vm = require("node:vm");

test("构建支持 CRLF、变化的注释长度和不同工作目录，检查模式发现过期产物", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "devin-build-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, "extension"));
  fs.copyFileSync(path.resolve(__dirname, "../build-userscript.js"), path.join(directory, "build-userscript.js"));
  fs.writeFileSync(path.join(directory,"extension/manifest.json"), JSON.stringify({
    version:"2.3.4", description:"test", content_scripts:[{ matches:["https://app.devin.ai/*"], js:["dictionary.js","content.js"] }],
  }));
  fs.writeFileSync(path.join(directory,"extension/dictionary.js"), '/**\r\n extra header\r\n */\r\nconst DICTIONARY = { Search: "搜索" };\r\n');
  fs.writeFileSync(path.join(directory,"extension/content.js"), '// short header\r\n(function(){ result = DICTIONARY.Search; })();\r\n');
  const run = (...args) => spawnSync(process.execPath, [path.join(directory,"build-userscript.js"), ...args], { cwd:os.tmpdir(), encoding:"utf8" });
  assert.equal(run().status, 0);
  const outputPath = path.join(directory,"devin-chinese.user.js");
  const output = fs.readFileSync(outputPath,"utf8");
  assert(!output.includes("\r"));
  assert(output.includes("// @version      2.3.4"));
  assert(output.includes("// @noframes"));
  const context = { result:null };
  vm.runInNewContext(output,context);
  assert.equal(context.result,"搜索");
  assert.equal(run("--check").status,0);
  fs.appendFileSync(outputPath,"// stale\n");
  assert.equal(run("--check").status,1);
});
