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
      e.preventDefault();
      e.stopPropagation();
      // Shift+Enter を再発火して改行を挿入（各サイトの既存の改行処理を利用）
      e.target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    }
  },
  true // capture phase
);
