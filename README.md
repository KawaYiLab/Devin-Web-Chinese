# Devin 网页端汉化

将 Devin 网页端（`app.devin.ai` 及 `*.devin.ai`）的界面全面汉化为中文。支持油猴脚本（推荐）和 Chrome 扩展两种安装方式。

**当前翻译覆盖：1112 条精确匹配 + 92 条正则规则**，涵盖所有页面、弹窗、菜单、工作日志等。

## 安装方式

### 方式一：油猴脚本（推荐）

适用于所有主流浏览器（Chrome、Edge、Firefox、Safari），安装最简单。

1. 安装 Tampermonkey 扩展：
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Safari](https://apps.apple.com/app/tampermonkey/id1482490089)

2. 点击下方链接直接安装脚本：

   **[点击安装 Devin 汉化脚本](https://update.greasyfork.org/scripts/584203/Devin%20%E7%BD%91%E9%A1%B5%E7%AB%AF%E6%B1%89%E5%8C%96.user.js)**

   或者手动安装：打开 Tampermonkey 面板 → 添加新脚本 → 粘贴 `devin-chinese.user.js` 的内容 → 保存。

3. 访问 https://app.devin.ai 即可看到汉化效果。

### 方式二：Chrome / Edge 扩展（开发者模式）

1. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions` 并回车。
2. 开启右上角的 **「开发者模式」** 开关。
3. 点击 **「加载已解压的扩展程序」**，选择本项目的 `extension` 文件夹。
4. 访问 `https://app.devin.ai` 即可看到汉化效果。

> Edge 浏览器同理，地址为 `edge://extensions`。

## 工作原理

- **静态词典替换**：`dictionary.js` 中定义了英文到中文的精确映射表和正则替换规则。
- **DOM 遍历**：使用 `TreeWalker` 遍历所有文本节点和属性（placeholder、title、aria-label、alt）。
- **实时监听**：使用 `MutationObserver` 监听 DOM 变化（React 重渲染等），自动翻译新增/变化节点。
- **防抖优化**：通过 `requestAnimationFrame` 合并多次回调，避免性能问题。
- **幂等设计**：可重复执行，不会造成重复翻译。

## 添加新词条

编辑 `extension/dictionary.js`（扩展版）或 `devin-chinese.user.js`（油猴版）：

### 精确匹配

```javascript
const DICTIONARY = {
  "English Text": "中文翻译",
  "Another Text": "另一个翻译"
};
```

### 正则规则（用于含动态内容的文案）

```javascript
const REGEX_RULES = [
  { pattern: /^(\d+)\s+items?$/i, replacement: "$1 个项目" }
];
```

## 文件结构

```
├── devin-chinese.user.js   # 油猴脚本（单文件，推荐使用）
├── extension/              # Chrome 扩展版本
│   ├── manifest.json       # Manifest V3 配置
│   ├── dictionary.js       # 翻译词典
│   └── content.js          # 核心逻辑
└── README.md
```


## 注意事项

- 纯客户端本地修改页面展示，不涉及 Devin 服务端。
- 如果 Devin 更新了 UI 文案，需要在词典中添加新翻译。
- 仅在 `*.devin.ai` 域名下生效，不影响其他网站。
- 如翻译异常，刷新页面即可。

## 贡献

欢迎提交 PR 补充翻译词条。编辑 `extension/dictionary.js` 添加新条目后，运行以下命令重新生成油猴脚本：

```bash
node build-userscript.js
```