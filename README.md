# Devin 网页端汉化

将 Devin 主应用（`https://app.devin.ai`）的常见英文界面翻译为简体中文，支持 Tampermonkey 油猴脚本和 Chrome / Edge 扩展。

**版本：1.1.1 · 3,734 条精确翻译 + 116 条正则规则。** 2026 年 11 月 7 日至 8 日对照实际登录页面补充。已打开全部 25 个设置路由和 234 个插件详情，并展开 27 个插件的折叠技能列表；最终版本逐项复查完成 76 个插件详情。词条数量不代表全站已完全覆盖，具体范围和未验证项见 [页面检查记录](docs/translation-audit.md)。

## 本次更新

- 相较上一检查点（1,747 条精确翻译、100 条规则），新增 1,987 条精确翻译和 16 条规则；相较项目原始的 1,194 个唯一词条，累计增加 2,540 条。
- 补充首页、偏好设置、组织设置、9 个集成详情、自定义六个页签、自动化、安全扫描、代码审查、API 和分析页面中的界面文案。
- 补齐插件市场介绍、详情与技能说明，包括 27 个折叠列表中的额外技能；保留产品名、技能命令名、变量和代码。
- 补充自动化预检、脚本约定、超时、通知、时间表、触发器和队列帮助；扫描表单中的 Profile 根据上下文译为“扫描配置”，账户中的同名标签保持“个人资料”。
- 保护聊天正文、Markdown、代码、差异、终端、编辑器和输入值。单独处理 Devin Slate 编辑器标记的占位提示，不改用户输入和 mention。
- 对已核对的官方引导 toast、代码工具栏操作提示和自动化脚本约定帮助设置限定例外，并增加回归测试。
- 监听文本和提示属性的动态变化；按子树合并任务，忽略自身写入，限制缓存大小，防止重复注入。
- 兼容不换行空格、弯引号和两种省略号；保留原有首尾空白与 DOM 结构。
- 扩展和油猴脚本仅匹配主应用，不进入预览子域或 iframe 中的 IDE、终端和第三方页面。
- 重写油猴构建脚本，直接合并完整源码；支持 LF / CRLF，与扩展共用版本、匹配域名和脚本顺序。

## 安装或更新

两种方式任选一种。不要同时启用旧版油猴脚本和扩展，否则旧版仍可能改写新版保护的区域。Devin 的显示语言请保持为 English，本项目使用英文文案匹配。

### 油猴脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 Tampermonkey 管理面板，编辑已有的 Devin 汉化脚本（首次使用则添加新脚本）。
3. 用本仓库 [devin-chinese.user.js](devin-chinese.user.js) 的完整内容替换并保存。
4. 刷新 Devin 标签页。

本地代码更新不会自动发布到 Greasy Fork。使用 [Greasy Fork 安装入口](https://update.greasyfork.org/scripts/584203/Devin%20%E7%BD%91%E9%A1%B5%E7%AB%AF%E6%B1%89%E5%8C%96.user.js) 时，请核对远端版本；要使用本次改动，直接安装仓库内生成的脚本。

### Chrome / Edge 扩展

1. 打开 `chrome://extensions`（Edge 使用 `edge://extensions`）。
2. 开启开发者模式，点击“加载已解压的扩展程序”，选择本仓库的 [extension](extension) 文件夹。
3. 已加载此目录的用户，在扩展管理页点击该扩展的重新加载按钮。
4. 刷新 Devin 标签页。

扩展无需额外权限；只在本地修改页面文字，不调用翻译服务，不读取输入值，不发送页面内容。

## 开发与验证

需要 Node.js 22.22.2 或更新版本。

```bash
npm ci
npm run build
npm run check
npm test
npm run test:browser
```

- `build`：根据扩展源码生成单文件油猴脚本，不依赖运行目录或固定行号。
- `check`：检查重复词条、正则、JavaScript 语法、版本与域名，并确认生成文件没有过期。
- `test`：DOM 行为和构建回归，包括动态更新、SPA、输入/正文保护、重复注入、节点及事件保持、跨域限制和 CRLF 构建。
- `test:browser`：在独立 headless Chromium 中，用拦截网络的本地夹具测试扩展源码和生成脚本；不会访问你的 Devin 账户。优先使用 Playwright Chromium，否则尝试本机 Chrome。若二者都未安装，先运行 `npx playwright install chromium`。

本次版本已通过构建、静态校验、18 项自动化测试，以及扩展和油猴脚本两套 Chromium 回归。真实页面检查在 2026 年 11 月 7 日至 8 日完成本轮范围，详细结果见 [页面检查记录](docs/translation-audit.md)。

检查账户没有可用额度、仓库、会话、扫描或 PR，因此多处仅检查了空状态和配置表单，未验证运行中的付费会话、真实扫描结果或实际 PR 审查。本地夹具验证内容保护行为，不能替代这些真实业务场景。真实浏览器验证使用临时脚本注入，不代表已持久安装或更新用户的扩展。

## 添加翻译

只编辑 [extension/dictionary.js](extension/dictionary.js)，再运行 `npm run build`。不要手工修改生成的油猴脚本。

```javascript
const DICTIONARY = {
  "English Text": "中文翻译",
};

const REGEX_RULES = [
  { pattern: /^(\d+)\s+items?$/i, replacement: "$1 个项目" },
];
```

优先增加完整文案的精确匹配。动态规则必须使用 `^` 和 `$` 限定整个字符串，保留变量内容，避免宽泛的单词或前缀替换。不要把账户名称、仓库名、用户消息或插件自定义内容加入公共词典。

引擎仅修改文本节点和展示属性：`placeholder`、`data-placeholder`、`title`、`aria-label`、`aria-description`、`aria-valuetext`、`alt`。不会重建 `innerHTML`，不会修改表单值、链接目标或事件监听器。页面开发者可以使用 `translate="no"`、`.notranslate` 或 `data-devin-i18n="off"` 排除区域；Devin 编辑器自身的 Slate 占位提示、官方代码块的工具栏属性，以及按固定文案和 DOM 关系识别的官方帮助有明确例外，详见检查记录。

## 文件结构

```text
extension/
  manifest.json          # 扩展配置与版本
  dictionary.js          # 统一翻译源
  content.js             # DOM 翻译引擎
build-userscript.js      # 确定性构建与 --check 模式
devin-chinese.user.js    # 生成的油猴脚本
scripts/
  validate.js            # 词典、版本与构建前检查
  browser-smoke.js       # Chromium 本地回归
tests/
  translation.test.js    # 翻译行为与内容保护
  build.test.js          # 换行、作用域与产物检查
docs/
  translation-audit.md   # 真实页面覆盖、最终复查与验证边界
```

## 已知边界

- 未命中的文案保持原样，不进行在线机器翻译。普通界面中被拆为多个文本节点的整句，也可能只能部分翻译。
- 全部插件详情已做初次检查与补译，最终版本逐项复查为 76/234，其余 158 个尚未逐个复查。部分设置及弹窗也未完成最终版本复查，具体清单见检查记录。
- 图片中的英文、产品名、技能命令名、变量和用户自定义内容不属于普通界面文案替换范围；企业专属功能和有数据时的运行界面尚未验证。
- 内容保护依赖语义标记及已确认的 Devin DOM 结构。页面大幅改版后需重新核对选择器；受保护的 Markdown 区域中的少量界面提示可能保留英文。
- 不处理封闭 Shadow DOM、嵌入框架或其他域名；这是作用范围的限制。
- 停用脚本或扩展后刷新页面，可恢复原始界面。

## 许可

[MIT](LICENSE)。欢迎提交遗漏文案和脱敏后的页面结构，或附回归测试的 PR。
