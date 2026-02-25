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
      document.execCommand("insertLineBreak");
    }
  },
  true // capture phase
);
