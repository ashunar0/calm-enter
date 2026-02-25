// 初回インストール時にデフォルト ON
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.local.set({ enabled: true });
  }
});

// Service Worker 起動時にアイコンを storage の状態と同期
chrome.storage.local.get("enabled", ({ enabled }) => {
  const isOn = enabled !== false;
  chrome.action.setIcon({
    path: isOn ? "icons/icon-on-48.png" : "icons/icon-off-48.png",
  });
  chrome.action.setTitle({
    title: isOn ? "Calm Enter: ON" : "Calm Enter: OFF",
  });
});

// アイコンクリックで ON/OFF トグル
chrome.action.onClicked.addListener(async (tab) => {
  const { enabled } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });

  chrome.action.setIcon({
    path: next ? "icons/icon-on-48.png" : "icons/icon-off-48.png",
  });
  chrome.action.setTitle({
    title: next ? "Calm Enter: ON" : "Calm Enter: OFF",
  });
});
