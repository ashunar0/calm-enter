let enabled = true;

chrome.storage.local.get("enabled", (result) => {
  enabled = result.enabled !== false; // デフォルト ON
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

function insertNewline(target) {
  const host = location.hostname;
  if (host === "chatgpt.com") {
    // ChatGPT: Shift+Enter 再発火が有効
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
  } else {
    // claude.ai, gemini, perplexity: InputEvent で改行挿入
    // ProseMirror 等のモダンエディタは beforeinput を処理する
    target.dispatchEvent(
      new InputEvent("beforeinput", {
        inputType: "insertLineBreak",
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }
}

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
      insertNewline(e.target);
    }
  },
  true // capture phase
);
