/**
 * Devin 网页端汉化 - 内容脚本
 *
 * 核心逻辑：
 * 1. 遍历页面所有文本节点，用词典进行精确匹配替换
 * 2. 处理元素属性（placeholder、title、aria-label、alt）
 * 3. 使用 MutationObserver 监听 DOM 变化，对新增/变化节点重新翻译
 * 4. 防抖处理避免频繁执行
 */

(function () {
  "use strict";

  /**
   * 翻译文本节点
   * 取 node.nodeValue，trim 后在词典里查精确匹配，命中则替换；保留原有首尾空白。
   * @param {Text} node - 文本节点
   */
  function translateTextNode(node) {
    const original = node.nodeValue;
    if (!original) return;

    const trimmed = original.trim();
    if (!trimmed) return;

    // 精确匹配词典
    if (DICTIONARY[trimmed]) {
      const leading = original.match(/^(\s*)/)[1];
      const trailing = original.match(/(\s*)$/)[1];
      const translated = leading + DICTIONARY[trimmed] + trailing;
      if (node.nodeValue !== translated) {
        node.nodeValue = translated;
      }
      return;
    }

    // 正则规则匹配
    for (let i = 0; i < REGEX_RULES.length; i++) {
      const rule = REGEX_RULES[i];
      if (rule.pattern.test(trimmed)) {
        const leading = original.match(/^(\s*)/)[1];
        const trailing = original.match(/(\s*)$/)[1];
        const translated = leading + trimmed.replace(rule.pattern, rule.replacement) + trailing;
        if (node.nodeValue !== translated) {
          node.nodeValue = translated;
        }
        return;
      }
    }
  }

  /**
   * 翻译元素属性
   * 处理 placeholder、title、aria-label、alt 属性
   * @param {Element} element - DOM 元素
   */
  function translateAttributes(element) {
    const attrs = ["placeholder", "title", "aria-label", "alt"];
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      const value = element.getAttribute(attr);
      if (!value) continue;

      const trimmed = value.trim();
      if (DICTIONARY[trimmed]) {
        const translated = DICTIONARY[trimmed];
        if (element.getAttribute(attr) !== translated) {
          element.setAttribute(attr, translated);
        }
      } else {
        // 尝试正则规则
        for (let j = 0; j < REGEX_RULES.length; j++) {
          const rule = REGEX_RULES[j];
          if (rule.pattern.test(trimmed)) {
            const translated = trimmed.replace(rule.pattern, rule.replacement);
            if (element.getAttribute(attr) !== translated) {
              element.setAttribute(attr, translated);
            }
            break;
          }
        }
      }
    }
  }

  /**
   * 遍历 DOM 树，翻译所有文本节点和元素属性
   * @param {Node} root - 遍历的根节点
   */
  function walk(root) {
    // 遍历文本节点
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      translateTextNode(textNode);
    }

    // 遍历元素节点，处理属性
    if (root.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(root);
    }

    const elements = root.querySelectorAll
      ? root.querySelectorAll("*")
      : [];
    for (let i = 0; i < elements.length; i++) {
      translateAttributes(elements[i]);
    }
  }

  // 待处理节点队列与防抖标记
  let pendingNodes = [];
  let pendingFrame = null;

  /**
   * 防抖执行翻译，使用 requestAnimationFrame 合并多次回调
   * 所有调用的 nodes 都会被累积到队列中，确保不丢失任何变化节点
   * @param {Node[]} nodes - 需要翻译的节点列表
   */
  function scheduleTranslation(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      pendingNodes.push(nodes[i]);
    }
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(function () {
      pendingFrame = null;
      var toProcess = pendingNodes;
      pendingNodes = [];
      for (var i = 0; i < toProcess.length; i++) {
        var node = toProcess[i];
        if (node && node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node);
        } else if (node && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE)) {
          walk(node);
        }
      }
    });
  }

  /**
   * MutationObserver 回调
   * 监听 childList、subtree、characterData 变化
   */
  function onMutations(mutations) {
    const nodesToProcess = [];

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];

      if (mutation.type === "childList") {
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          nodesToProcess.push(mutation.addedNodes[j]);
        }
      } else if (mutation.type === "characterData") {
        nodesToProcess.push(mutation.target);
      }
    }

    if (nodesToProcess.length > 0) {
      scheduleTranslation(nodesToProcess);
    }
  }

  // 初始化：页面加载完成后执行一次全量翻译
  function init() {
    if (document.body) {
      walk(document.body);
    }

    // 设置 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(onMutations);
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 确保 DOM 已就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
