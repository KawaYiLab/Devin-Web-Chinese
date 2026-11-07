/** 独立 headless Chromium 回归：使用本地夹具，不访问账户或网络 API。 */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildUserscript } = require("../build-userscript");
const root = path.resolve(__dirname, "..");

(async () => {
  const options = { headless:true };
  // 优先使用 Playwright 浏览器；未下载时可复用本机 Chrome。
  if (!fs.existsSync(chromium.executablePath())) options.channel = "chrome";
  const browser = await chromium.launch(options);
  try {
    for (const mode of ["extension", "userscript"]) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><body>
        <main><button id="nav">New session</button><input id="search" placeholder="Search" value="Search">
        <pre>New session</pre><div class="prose-main">Search</div>
        <div contenteditable="true" data-devin-input-box="true" data-slate-editor="true" translate="no">
          <span data-slate-string>Search</span><span data-slate-placeholder="true" contenteditable="false">Ask Devin to build features, fix bugs, or work on your code</span>
        </div><section id="dynamic"></section></main></body></html>` }));
      await page.goto("https://app.devin.ai/org/local-test");
      if (mode === "userscript") await page.addScriptTag({ content:buildUserscript() });
      else for (const file of ["dictionary.js", "content.js"]) await page.addScriptTag({ path:path.join(root,"extension",file) });
      await page.waitForFunction(() => document.querySelector("#nav").textContent === "新建会话");
      assert.equal(await page.locator("#search").inputValue(), "Search");
      assert.equal(await page.locator("#search").getAttribute("placeholder"), "搜索");
      assert.equal(await page.locator("pre").textContent(), "New session");
      assert.equal(await page.locator(".prose-main").textContent(), "Search");
      assert.equal(await page.locator("[data-slate-string]").textContent(), "Search");
      assert.match(await page.locator("[data-slate-placeholder]").textContent(), /Devin 实现功能/);
      await page.evaluate(() => {
        document.querySelector("#nav").setAttribute("aria-label", "Settings");
        document.querySelector("#dynamic").innerHTML = '<button title="Customizations">Security</button>';
      });
      await page.waitForFunction(() => document.querySelector("#dynamic button").textContent === "安全");
      assert.equal(await page.locator("#dynamic button").getAttribute("title"), "自定义");
      assert.equal(await page.locator("#nav").getAttribute("aria-label"), "设置");
      // 路由切换后继续翻译；重复注入不报错、不建立第二个引擎。
      await page.evaluate(() => { history.pushState({}, "", "/settings/preferences"); document.querySelector("#dynamic").innerHTML = '<h1>Keyboard shortcuts</h1>'; });
      await page.addScriptTag({ content:buildUserscript() });
      await page.waitForFunction(() => document.querySelector("h1").textContent === "键盘快捷键");
      assert.deepEqual(errors, []);
      console.log(mode + ": Chromium DOM、动态属性、SPA、重复注入和内容保护通过。");
      await context.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
