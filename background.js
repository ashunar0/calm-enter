// インストール時にデフォルト ON
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
});

// アイコンクリックで ON/OFF トグル
chrome.action.onClicked.addListener(async (tab) => {
  const { enabled } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });

  // アイコンとツールチップを更新
  chrome.action.setIcon({
    path: next ? "icons/icon-on-48.png" : "icons/icon-off-48.png",
  });
  chrome.action.setTitle({
    title: next ? "Calm Enter: ON" : "Calm Enter: OFF",
  });
});
