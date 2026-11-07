/**
 * 本地界面翻译：保留 DOM 结构，只修改已知文案的文本节点和展示属性。
 * dictionary.js 必须先加载。编辑器、对话正文、代码和预览内容不参与翻译。
 */
(function () {
  "use strict";

  if (location.hostname !== "app.devin.ai" || window.top !== window) return;
  const MARKER = "data-devin-chinese-version";
  if (document.documentElement.hasAttribute(MARKER)) return;
  document.documentElement.setAttribute(MARKER, "1.1.1");

  const ATTRIBUTES = ["placeholder", "data-placeholder", "title", "aria-label", "aria-description", "aria-valuetext", "alt"];
  const EDITABLE = '[contenteditable]:not([contenteditable="false"]), [role="textbox"], input, textarea';
  const PROTECTED = [
    "script", "style", "noscript", "template", "pre", "code", "kbd", "samp",
    '[translate="no"]', ".notranslate", '[data-devin-i18n="off"]',
    ".monaco-editor", ".cm-editor", ".CodeMirror", ".xterm",
    ".markdown", ".markdown-body", ".prose", ".prose-main", ".message-item--content",
    '[data-message-content]', '[data-message-author-role]',
    '[data-testid="transcript-user-message"]', '[data-testid="transcript-initial-user-message"]',
    '[data-testid="transcript-agent-message"]', '[data-testid="transcript-agent-message-tldr"]',
    '[data-testid="personal-plugin-change-diff"]', ".text-diff-added", ".text-diff-removed",
  ].join(",");
  // Slate 自己标记的提示文字不属于用户输入。仅为 Devin 的输入框开放这个例外。
  const DEVIN_EDITOR = '[data-devin-input-box="true"][data-slate-editor="true"]';
  const SLATE_PLACEHOLDER = '[data-slate-placeholder="true"]';
  const cache = new Map();
  const normalizedDictionary = new Map();
  const pendingTrees = new Set();
  const pendingAttributes = new Set();
  const ownTextWrites = new WeakMap();
  const ownAttributeWrites = new WeakMap();
  let timer = null;

  function normalize(value) {
    return value.replace(/[\u2018\u2019]/g, "'").replace(/\u2026/g, "...").replace(/\s+/g, " ").trim();
  }
  for (const [key, value] of Object.entries(DICTIONARY)) {
    const normalized = normalize(key);
    // 有歧义的归一化键只允许原文精确匹配。
    if (normalizedDictionary.has(normalized) && normalizedDictionary.get(normalized) !== value) {
      normalizedDictionary.set(normalized, null);
    } else if (!normalizedDictionary.has(normalized)) {
      normalizedDictionary.set(normalized, value);
    }
  }

  function translate(value) {
    if (!value || value.length > 2000 || !/[A-Za-z]/.test(value)) return value;
    const trimmed = value.trim();
    let result;
    if (cache.has(trimmed)) {
      result = cache.get(trimmed);
    } else {
      const normalized = normalize(trimmed);
      result = Object.hasOwn(DICTIONARY, trimmed) ? DICTIONARY[trimmed] : normalizedDictionary.get(normalized);
      if (!result) {
        for (const rule of REGEX_RULES) {
          rule.pattern.lastIndex = 0;
          if (rule.pattern.test(normalized)) {
            rule.pattern.lastIndex = 0;
            result = normalized.replace(rule.pattern, rule.replacement);
            break;
          }
        }
      }
      result ||= trimmed;
      if (cache.size >= 1500) cache.clear();
      cache.set(trimmed, result);
    }
    if (result === trimmed) return value;
    return value.slice(0, value.indexOf(trimmed)) + result + value.slice(value.indexOf(trimmed) + trimmed.length);
  }

  function isProtected(element) {
    return Boolean(element?.closest(PROTECTED + "," + EDITABLE));
  }

  function writeText(node) {
    let value = translate(node.nodeValue);
    // 扫描表单的 Profile 指扫描配置；账户中的同名标签仍指个人资料。
    const profileHelp = "Without a profile, Devin runs a general scan. Profiles let you customize which finding types and patterns to check for.";
    if (node.nodeValue.trim() === "Profile" && node.parentElement?.matches('h4') &&
        [...node.parentElement.querySelectorAll('button[aria-label]')].some(button =>
          [profileHelp, DICTIONARY[profileHelp]].includes(button.getAttribute('aria-label')))) {
      value = node.nodeValue.replace("Profile", "扫描配置");
    }
    if (value !== node.nodeValue) {
      ownTextWrites.set(node, value);
      node.nodeValue = value;
    }
  }

  function translateAttributes(element) {
    // 输入控件的 placeholder/无障碍名称属于界面，其 value/正文始终不改。
    const ownEditor = element.matches(DEVIN_EDITOR);
    const blockedAncestor = element.parentElement?.closest(PROTECTED + "," + EDITABLE);
    if (blockedAncestor || (element.matches(PROTECTED) && !ownEditor)) {
      if (element.closest('[data-code-block-toolbar="true"]')) translateCodeControls(element);
      return;
    }
    for (const name of ATTRIBUTES) {
      const original = element.getAttribute(name);
      if (!original) continue;
      const translated = translate(original);
      if (translated !== original) {
        let writes = ownAttributeWrites.get(element);
        if (!writes) ownAttributeWrites.set(element, writes = new Map());
        writes.set(name, translated);
        element.setAttribute(name, translated);
      }
    }
  }

  function translateEditorHint(element) {
    const editor = element.closest(DEVIN_EDITOR);
    if (!editor || isProtected(editor.parentElement) || editor.getAttribute("data-devin-i18n") === "off") return;
    translateAttributes(editor);
    const hints = element.matches(SLATE_PLACEHOLDER) ? [element] : element.querySelectorAll(SLATE_PLACEHOLDER);
    for (const hint of hints) {
      // Slate 的占位节点仅包含纯文本；不改写编辑器中的 mention、附件或用户内容。
      if (hint.childNodes.length === 1 && hint.firstChild.nodeType === Node.TEXT_NODE) writeText(hint.firstChild);
    }
  }

  // 官方引导 toast 也使用 prose-main。仅放行已核对的固定文案及容器，
  // 不能仅凭 Markdown 样式放开正文，也不处理 toast 内的用户标题。
  function translateUiHint(element) {
    // 自动化的脚本约定使用 pre 展示说明。仅放行与官方帮助按钮关联的
    // 完整已知说明；实际脚本、普通 pre、正文和显式排除区域保持原样。
    if (element?.matches('pre') && !isProtected(element.parentElement) &&
        !element.matches('[translate="no"],.notranslate,[data-devin-i18n="off"]') &&
        /^\/org\/[^/]+\/automations(?:\/|$)/.test(location.pathname) &&
        element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
      const text = element.firstChild.nodeValue;
      const container = element.parentElement;
      if (text.startsWith('$EVENT_FILE     the trigger event (read-only JSON)\n') &&
          Object.hasOwn(DICTIONARY, text) && container.id &&
          container.closest('[role="presentation"][data-open]') &&
          [...document.querySelectorAll('button[aria-describedby]')].some(button =>
            button.getAttribute('aria-describedby').split(/\s+/).includes(container.id) &&
            ['Script contract', DICTIONARY['Script contract']].includes(button.getAttribute('aria-label')) &&
            !isProtected(button))) writeText(element.firstChild);
      return;
    }
    if (!element?.matches('.prose-main') || !element.closest('[data-sonner-toast] [data-content]') || isProtected(element.parentElement)) return;
    for (const node of element.childNodes) if (node.nodeType === Node.TEXT_NODE &&
        normalize(node.nodeValue) === "Connect your codebase to try Devin for free") writeText(node);
  }

  // 代码块本身标记 translate=no，但官方工具栏的无障碍名称属于界面。
  // 仅处理已观察到的工具栏和固定操作名，代码内容与外层显式排除仍受保护。
  function translateCodeControls(root) {
    const selector = '[data-code-block-toolbar="true"][role="toolbar"]';
    const nearest = root.closest(selector);
    const toolbars = nearest ? [nearest] : root.querySelectorAll(selector);
    for (const toolbar of toolbars) {
      const block = toolbar.closest('[data-code-block="true"]');
      if (!block || block.matches('[data-devin-i18n="off"],.notranslate') ||
          block.parentElement?.closest('[translate="no"],.notranslate,[data-devin-i18n="off"],.monaco-editor,.cm-editor,.xterm,' + EDITABLE)) continue;
      for (const control of [toolbar, ...toolbar.querySelectorAll('button')]) {
        for (const name of ['aria-label', 'title']) {
          const original = control.getAttribute(name);
          if (!["Actions", "Copy code", "Copy command", "Copied!"].includes(original)) continue;
          const translated = translate(original);
          if (translated === original) continue;
          let writes = ownAttributeWrites.get(control);
          if (!writes) ownAttributeWrites.set(control, writes = new Map());
          writes.set(name, translated);
          control.setAttribute(name, translated);
        }
      }
    }
  }

  function walk(root) {
    if (!root.isConnected) return;
    if (root.nodeType === Node.TEXT_NODE) {
      if (!isProtected(root.parentElement)) writeText(root);
      else if (root.parentElement?.matches(SLATE_PLACEHOLDER)) translateEditorHint(root.parentElement);
      else translateUiHint(root.parentElement);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(root);
      if (isProtected(root)) {
        translateEditorHint(root);
        translateUiHint(root);
        translateCodeControls(root);
        return;
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          translateAttributes(node);
          if (node.matches(PROTECTED + "," + EDITABLE)) {
            translateEditorHint(node);
            translateUiHint(node);
            translateCodeControls(node);
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let node;
    while ((node = walker.nextNode())) if (node.nodeType === Node.TEXT_NODE) writeText(node);
  }

  function flush() {
    timer = null;
    // 父子节点合并，只遍历最外层发生变更的子树。
    for (const node of pendingTrees) {
      let parent = node.parentNode;
      while (parent && !pendingTrees.has(parent)) parent = parent.parentNode;
      if (!parent) walk(node);
    }
    pendingTrees.clear();
    for (const element of pendingAttributes) if (element.isConnected) translateAttributes(element);
    pendingAttributes.clear();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target;
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) pendingTrees.add(node);
      } else if (mutation.type === "characterData") {
        const ownValue = ownTextWrites.get(target);
        ownTextWrites.delete(target);
        if (ownValue !== target.nodeValue) pendingTrees.add(target);
      } else if (mutation.type === "attributes") {
        const name = mutation.attributeName;
        const writes = ownAttributeWrites.get(target);
        const ownValue = writes?.get(name);
        writes?.delete(name);
        if (ownValue !== target.getAttribute(name)) {
          if (ATTRIBUTES.includes(name)) pendingAttributes.add(target);
          else pendingTrees.add(target);
        }
      }
    }
    // 固定窗口合批，不因持续流式输出无限推迟；后台标签页也能处理。
    if (timer === null && (pendingTrees.size || pendingAttributes.size)) timer = setTimeout(flush, 32);
  });

  function init() {
    observer.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: [...ATTRIBUTES, "translate", "contenteditable", "data-devin-i18n"],
    });
    if (document.body) walk(document.body);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
