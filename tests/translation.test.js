const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const { buildUserscript } = require("../build-userscript");
const root = path.resolve(__dirname, "..");
const dictionary = fs.readFileSync(path.join(root, "extension/dictionary.js"), "utf8");
const engine = fs.readFileSync(path.join(root, "extension/content.js"), "utf8");
const settle = (window) => new Promise((resolve) => window.setTimeout(resolve, 100));

async function setup(t, html, { url = "https://app.devin.ai/org/test", userscript = false } = {}) {
  const dom = new JSDOM("<!doctype html><body>" + html + "</body>", { url, runScripts: "outside-only" });
  t.after(() => dom.window.close());
  await new Promise((resolve) => dom.window.addEventListener("load", resolve, { once: true }));
  dom.window.eval(userscript ? buildUserscript() : "(function(){" + dictionary + "\n" + engine + "})();");
  await settle(dom.window);
  return { window: dom.window, document: dom.window.document };
}

for (const userscript of [false, true]) {
  test((userscript ? "油猴" : "扩展") + "：精确翻译、正则、原型键与空白保留", async (t) => {
    const { document } = await setup(t, '<button>  New session \n</button><p>3 sessions</p><i>toString</i><b>constructor</b><em>Unknown text stays</em>', { userscript });
    assert.equal(document.querySelector("button").textContent, "  新建会话 \n");
    assert.equal(document.querySelector("p").textContent, "3 个会话");
    assert.equal(document.querySelector("i").textContent, "toString");
    assert.equal(document.querySelector("b").textContent, "constructor");
    assert.equal(document.querySelector("em").textContent, "Unknown text stays");
  });
}

test("归一化不换行空格、省略号和弯引号", async (t) => {
  const { document } = await setup(t, '<p>Search sessions…</p><b>Don’t notify me again</b><span>New&nbsp;session</span><i>Loading…</i>');
  assert.equal(document.querySelector("p").textContent, "搜索会话...");
  assert.equal(document.querySelector("b").textContent, "不再通知我");
  assert.equal(document.querySelector("span").textContent, "新建会话");
  assert.match(document.querySelector("i").textContent, /加载/);
});

test("扫描配置标签按帮助文案区分账户个人资料", async (t) => {
  const help = 'Without a profile, Devin runs a general scan. Profiles let you customize which finding types and patterns to check for.';
  const { document } = await setup(t, `<h4 id="scan">Profile<button aria-label="${help}"></button></h4><h4 id="account">Profile</h4><div translate="no"><h4 id="off">Profile<button aria-label="${help}"></button></h4></div>`);
  assert.equal(document.querySelector('#scan').firstChild.nodeValue, '扫描配置');
  assert.equal(document.querySelector('#account').textContent, '个人资料');
  assert.equal(document.querySelector('#off').firstChild.nodeValue, 'Profile');
});

test("自动化脚本约定仅翻译关联的官方帮助，保留代码及排除区域", async (t) => {
  const source = require('node:vm').runInNewContext(dictionary + ';DICTIONARY');
  const contract = Object.keys(source).find(key => key.startsWith('$EVENT_FILE     the trigger event (read-only JSON)\n'));
  assert(contract, '缺少实际页面中的脚本约定');
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const hint = id => `<button aria-label="Script contract" aria-describedby="${id}"></button><div role="presentation" data-open><div id="${id}"><pre>${escape(contract)}</pre></div></div>`;
  const { document, window } = await setup(t, hint('help') + `<pre id="code">${escape(contract)}</pre><div translate="no">${hint('off')}</div><div data-message-content>${hint('message')}</div>`, { url: 'https://app.devin.ai/org/test/automations/create' });
  assert.equal(document.querySelector('#help pre').textContent, source[contract]);
  for (const selector of ['#code', '#off pre', '#message pre']) assert.equal(document.querySelector(selector).textContent, contract);
  document.querySelector('#help pre').firstChild.nodeValue = contract;
  await settle(window);
  assert.equal(document.querySelector('#help pre').textContent, source[contract]);
  const unrelated = await setup(t, hint('other'), { url: 'https://app.devin.ai/org/test' });
  assert.equal(unrelated.document.querySelector('pre').textContent, contract);
});

test("翻译提示属性，保留输入值、标识符、链接和选项值", async (t) => {
  const { document } = await setup(t, '<input id="Search" name="Search" value="Search" placeholder="Search" aria-label="Search"><textarea placeholder="Search">New session</textarea><a href="/Search" title="New session">New session</a><select><option value="Settings">Settings</option></select>');
  const input = document.querySelector("input");
  assert.equal(input.placeholder, "搜索");
  assert.equal(input.getAttribute("aria-label"), "搜索");
  for (const name of ["value", "id", "name"]) assert.equal(input.getAttribute(name), "Search");
  assert.equal(document.querySelector("textarea").value, "New session");
  assert.equal(document.querySelector("textarea").placeholder, "搜索");
  assert.equal(document.querySelector("a").getAttribute("href"), "/Search");
  assert.equal(document.querySelector("option").value, "Settings");
});

test("跳过代码、终端、编辑器、对话正文和显式排除区域", async (t) => {
  const { document, window } = await setup(t, [
    '<pre>New session</pre>', '<code>Search</code>', '<script>Search</script>', '<style>Search</style>',
    '<kbd>Search</kbd>', '<samp>Search</samp>', '<div class="monaco-editor">Search</div>',
    '<div class="cm-editor">Search</div>', '<div class="xterm">Search</div>',
    '<div class="prose-main">Search</div>', '<div class="message-item--content">Search</div>',
    '<div data-testid="transcript-user-message">Search</div>', '<div data-testid="transcript-agent-message">Search</div>',
    '<div contenteditable="true"><b>Search</b></div>', '<div role="textbox">Search</div>',
    '<div translate="no"><b title="Search">Search</b></div>', '<div class="notranslate">Search</div>',
    '<div data-devin-i18n="off">Search</div>', '<div class="text-diff-added">Search</div>',
  ].join(""));
  assert(!/[\u4e00-\u9fff]/.test(document.body.textContent));
  assert.equal(document.querySelector('[translate="no"] b').title, "Search");
  document.querySelector(".prose-main").append("New session");
  document.querySelector("pre").firstChild.nodeValue = "Settings";
  await settle(window);
  assert.equal(document.querySelector("pre").textContent, "Settings");
  assert.equal(document.querySelector(".prose-main").textContent, "SearchNew session");
});

test("Slate 提示例外不改动用户输入、mention 或选区", async (t) => {
  const { document, window } = await setup(t, '<div data-devin-input-box="true" data-slate-editor="true" contenteditable="true" translate="no" class="notranslate" aria-label="Prompt"><span data-slate-string>New session</span><span contenteditable="false">Search</span><span data-slate-placeholder="true" contenteditable="false">Ask Devin to build features, fix bugs, or work on your code</span></div>');
  assert.equal(document.querySelector("[data-slate-string]").textContent, "New session");
  assert.equal(document.querySelector('[contenteditable="false"]').textContent, "Search");
  assert.match(document.querySelector("[data-slate-placeholder]").textContent, /Devin 实现功能/);
  assert.equal(document.querySelector("[data-slate-editor]").getAttribute("aria-label"), "提示词");
  const node = document.querySelector("[data-slate-string]").firstChild;
  const range = document.createRange(); range.setStart(node, 2); range.setEnd(node, 5);
  window.getSelection().addRange(range);
  node.nodeValue = "New session";
  const hint = document.querySelector("[data-slate-placeholder]");
  hint.textContent = "Search";
  await settle(window);
  assert.equal(hint.textContent, "搜索");
  assert.equal(node.nodeValue, "New session");
  assert.equal(window.getSelection().anchorNode, node);
});

test("官方 toast 的 Markdown 提示例外不影响聊天、普通 prose 或排除区域", async (t) => {
  const phrase = "Connect your codebase to try Devin for free";
  const toast = (id, text = phrase) => `<li data-sonner-toast><div data-content><p><span id="${id}" class="prose-main"> ${text} </span></p></div></li>`;
  const { document, window } = await setup(t, toast("official") + toast("title", "Search") +
    `<div data-message-content>${toast("message")}</div><div translate="no">${toast("off")}</div>` +
    `<span id="ordinary" class="prose-main">${phrase}</span>`);
  assert.equal(document.querySelector("#official").textContent.trim(), "连接代码库，免费体验 Devin");
  for (const id of ["message", "off", "ordinary"]) assert.equal(document.querySelector("#" + id).textContent.trim(), phrase);
  assert.equal(document.querySelector("#title").textContent.trim(), "Search");
  // 实际页面的提示由三个相邻文本节点组成，不能假设只有一个节点。
  const official = document.querySelector("#official");
  official.replaceChildren(document.createTextNode(" "), document.createTextNode(phrase), document.createTextNode(" "));
  await settle(window);
  assert.equal(official.textContent, " 连接代码库，免费体验 Devin ");
});

test("真实页面的动态标签完整翻译并保留快捷键、日期和数据", async (t) => {
  const { document } = await setup(t, '<button aria-label="Change shortcut Ctrl+Shift+A for Toggle board agent"></button>' +
    '<button title="Remove Ctrl+K from Command palette"></button><p>Remove notes from project</p>' +
    '<button aria-label=\'Push "My sessions" to mobile\'></button><button title=\'Hide the notifications in "Usage &amp; billing"\'></button>' +
    '<b>This month (Nov 1 – Nov 30)</b><i>After Oct 24</i><span>Total cost: $12.50</span>' +
    '<div contenteditable="true" data-devin-input-box="true" data-slate-editor="true"><span data-slate-placeholder="true">i.e. describe what types of trigger events are routed to this automation and how the agent should behave</span><span data-slate-string>New Automation</span></div>');
  const buttons = document.querySelectorAll("button");
  assert.equal(buttons[0].getAttribute("aria-label"), "更改“切换看板智能体”的快捷键 Ctrl+Shift+A");
  assert.equal(buttons[1].title, "从“命令面板”移除 Ctrl+K");
  assert.equal(document.querySelector("p").textContent, "Remove notes from project");
  assert.equal(buttons[2].getAttribute("aria-label"), "将“我的会话”推送至移动端");
  assert.equal(buttons[3].title, "收起“用量与计费”中的通知");
  assert.equal(document.querySelector("b").textContent, "本月（11月1日至11月30日）");
  assert.equal(document.querySelector("i").textContent, "10月24日之后");
  assert.equal(document.querySelector("span").textContent, "总费用：$12.50");
  assert.match(document.querySelector('[data-slate-placeholder]').textContent, /^例如，描述/);
  assert.equal(document.querySelector('[data-slate-string]').textContent, "New Automation");
});

test("官方代码工具栏只翻译操作提示，保留代码及显式排除", async (t) => {
  const block = '<div data-code-block="true" translate="no"><div role="toolbar" data-code-block-toolbar="true" aria-label="Actions"><button aria-label="Copy code"></button></div><pre><code>New session</code></pre></div>';
  const { document, window } = await setup(t, '<div class="prose-main">' + block + '</div><section data-devin-i18n="off">' + block + '</section>');
  const buttons = document.querySelectorAll('button');
  assert.equal(buttons[0].getAttribute('aria-label'), '复制代码');
  assert.equal(document.querySelector('[role="toolbar"]').getAttribute('aria-label'), '操作');
  assert.equal(buttons[1].getAttribute('aria-label'), 'Copy code');
  for (const code of document.querySelectorAll('code')) assert.equal(code.textContent, 'New session');
  buttons[0].setAttribute('aria-label', 'Copy command');
  await settle(window);
  assert.equal(buttons[0].getAttribute('aria-label'), '复制命令');
});

test("响应延迟插入、文本替换、属性更新及 SPA 整个 body 替换", async (t) => {
  const { document, window } = await setup(t, '<button title="Search">Search</button>');
  const button = document.querySelector("button");
  button.firstChild.nodeValue = "Settings";
  button.title = "New session";
  button.setAttribute("aria-description", "3 sessions");
  const div = document.createElement("div");
  div.innerHTML = '<span>Customizations</span><input placeholder="Search">';
  document.body.append(div);
  await settle(window);
  assert.equal(button.textContent, "设置");
  assert.equal(button.title, "新建会话");
  assert.equal(button.getAttribute("aria-description"), "3 个会话");
  assert.equal(div.querySelector("span").textContent, "自定义");
  assert.equal(div.querySelector("input").placeholder, "搜索");
  const body = document.createElement("body"); body.textContent = "New session";
  document.body.replaceWith(body);
  await settle(window);
  assert.equal(body.textContent, "新建会话");
});

test("移除节点不再翻译，取消排除后可以翻译", async (t) => {
  const { document, window } = await setup(t, '<div translate="no">Settings</div>');
  const detached = document.createElement("button"); detached.textContent = "Search";
  document.body.append(detached); detached.remove();
  document.querySelector("div").removeAttribute("translate");
  await settle(window);
  assert.equal(detached.textContent, "Search");
  assert.equal(document.querySelector("div").textContent, "设置");
});

test("重复注入与自身 DOM 写入不会建立循环监听", async (t) => {
  const { document, window } = await setup(t, '<button>Search</button>');
  let callbacks = 0;
  const observer = new window.MutationObserver(() => callbacks++);
  observer.observe(document.documentElement, { subtree:true, childList:true, characterData:true, attributes:true });
  window.eval(buildUserscript());
  await settle(window);
  assert.equal(callbacks, 0);
  document.querySelector("button").firstChild.nodeValue = "Settings";
  await settle(window);
  assert.equal(document.querySelector("button").textContent, "设置");
  const after = callbacks;
  await settle(window);
  assert.equal(callbacks, after);
  observer.disconnect();
});

test("父子嵌套批量更新保持节点与事件监听器", async (t) => {
  const { document, window } = await setup(t, '<main></main>');
  const main = document.querySelector("main");
  let clicks = 0;
  const nodes = [];
  for (let i = 0; i < 250; i++) {
    const section = document.createElement("section"); main.append(section);
    const button = document.createElement("button"); section.append(button);
    button.append("Search"); button.addEventListener("click", () => clicks++); nodes.push(button);
  }
  await settle(window);
  for (const button of nodes) { assert.equal(button.textContent, "搜索"); button.click(); }
  assert.equal(clicks, 250);
  assert.equal(document.querySelectorAll("button").length, 250);
});

test("只在 Devin 主应用运行，排除预览子域和嵌入框架", async (t) => {
  for (const url of ["https://example.com", "https://preview.devin.ai", "https://ide.devin.ai"]) {
    const { document } = await setup(t, '<button>Search</button>', { url });
    assert.equal(document.querySelector("button").textContent, "Search");
    assert(!document.documentElement.hasAttribute("data-devin-chinese-version"));
  }
  const { document } = await setup(t, '<iframe></iframe>');
  const frame = document.querySelector("iframe").contentWindow;
  frame.document.body.innerHTML = '<button>Search</button>';
  frame.eval(buildUserscript());
  assert.equal(frame.document.querySelector("button").textContent, "Search");
});

test("长正文和未覆盖的 Read 前缀不被泛化规则修改", async (t) => {
  const { document } = await setup(t, '<p>Read my project notes</p><b>Get started 2 of 10</b><span>Search skills…</span><em>' + 'x'.repeat(3000) + '</em>');
  assert.equal(document.querySelector("p").textContent, "Read my project notes");
  assert.equal(document.querySelector("b").textContent, "入门指南 2 / 10");
  assert.equal(document.querySelector("span").textContent, "搜索技能…");
  assert.equal(document.querySelector("em").textContent.length, 3000);
});
