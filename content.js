let enabled = true;

chrome.storage.local.get("enabled", (result) => {
  enabled = result.enabled !== false; // デフォルト ON
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

document.addEventListener(
  "keydown",
  (e) => {
    if (!enabled) return;

    if (
      e.key === "Enter" &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.isComposing
    ) {
      // サイトの送信ハンドラをブロック
      e.stopPropagation();

      const host = location.hostname;
      if (host === "claude.ai") {
        // Claude: preventDefault せず、ブラウザのデフォルト改行挿入に任せる
      } else if (host === "chatgpt.com") {
        // ChatGPT: Shift+Enter 再発火で改行
        e.preventDefault();
        e.target.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      } else {
        // gemini, perplexity: デフォルト改行挿入に任せる
      }
    }
  },
  true // capture phase
);
