let enabled = true;

chrome.storage.local.get("enabled", (result) => {
  enabled = result.enabled !== false; // デフォルト ON
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

console.log("[Calm Enter] loaded on", location.hostname);

function shouldBlock(e) {
  return (
    enabled &&
    e.key === "Enter" &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.isComposing
  );
}

// keydown, keypress, keyup すべてを capture phase でブロック
for (const eventType of ["keydown", "keypress", "keyup"]) {
  document.addEventListener(
    eventType,
    (e) => {
      if (!shouldBlock(e)) return;

      console.log(`[Calm Enter] blocked ${eventType}`, e.key);
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();

      // keydown のときだけ改行を挿入
      if (eventType === "keydown") {
        const host = location.hostname;
        if (host === "chatgpt.com") {
          e.target.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              shiftKey: true,
              bubbles: true,
              cancelable: true,
            })
          );
        } else if (host === "claude.ai") {
          document.execCommand("insertParagraph");
        } else {
          document.execCommand("insertLineBreak");
        }
      }
    },
    true // capture phase
  );
}
