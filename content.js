let enabled = true;

chrome.storage.local.get("enabled", (result) => {
  enabled = result.enabled !== false; // デフォルト ON
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

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

function dispatchShiftEnter(target) {
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
  );
}

function insertNewline(target) {
  const host = location.hostname;
  if (host === "chatgpt.com" || host === "www.perplexity.ai") {
    dispatchShiftEnter(target);
  } else if (host === "claude.ai") {
    document.execCommand("insertParagraph");
  } else {
    // gemini.google.com 等
    document.execCommand("insertLineBreak");
  }
}

// keydown, keypress, keyup すべてを capture phase でブロック
for (const eventType of ["keydown", "keypress", "keyup"]) {
  document.addEventListener(
    eventType,
    (e) => {
      if (!shouldBlock(e)) return;

      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();

      if (eventType === "keydown") {
        insertNewline(e.target);
      }
    },
    true // capture phase
  );
}
