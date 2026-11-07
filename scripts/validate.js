const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const acorn = require("acorn");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const source = read("extension/dictionary.js");
const ast = acorn.parse(source, { ecmaVersion: 2022 });
const properties = ast.body.find((n) => n.declarations?.[0].id.name === "DICTIONARY").declarations[0].init.properties;
const keys = new Set();
for (const property of properties) {
  const key = property.key.value;
  assert.equal(typeof key, "string");
  assert(!keys.has(key), "重复词条: " + key);
  assert.equal(typeof property.value.value, "string", "译文必须是字符串: " + key);
  assert(property.value.value.trim(), "空译文: " + key);
  keys.add(key);
}
const data = vm.runInNewContext(source + ";({ DICTIONARY, REGEX_RULES })");
const patterns = new Set();
for (const rule of data.REGEX_RULES) {
  assert(rule.pattern.source.startsWith("^") && rule.pattern.source.endsWith("$"), "正则必须匹配完整文案: " + rule.pattern);
  assert(!rule.pattern.global && !rule.pattern.sticky, "正则不应包含 g/y 标记");
  assert(!patterns.has(String(rule.pattern)), "重复正则: " + rule.pattern);
  assert(["string", "function"].includes(typeof rule.replacement));
  patterns.add(String(rule.pattern));
}
const manifest = JSON.parse(read("extension/manifest.json"));
const pkg = JSON.parse(read("package.json"));
assert.equal(manifest.version, pkg.version, "扩展和 package.json 的版本必须一致");
assert(read("extension/content.js").includes('setAttribute(MARKER, "' + manifest.version + '")'), "运行时版本必须一致");
assert.deepEqual(manifest.content_scripts[0].matches, ["https://app.devin.ai/*"]);
assert.equal(manifest.content_scripts[0].all_frames, false);
assert.deepEqual(manifest.permissions, []);
for (const file of manifest.content_scripts[0].js) new vm.Script(read("extension/" + file), { filename: file });
console.log(`${keys.size} 条精确翻译，${patterns.size} 条正则；语法、重复项、域名和版本检查通过。`);
