# Calm Enter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AIチャットサイトで Enter による誤送信を防ぎ、Cmd+Enter で送信する Chrome 拡張機能を作る

**Architecture:** Manifest V3 の Content Script で対象サイトに JS を注入し、capture phase の keydown リスナーでイベントを制御。background.js (Service Worker) でON/OFF状態を管理し、chrome.storage.local で永続化する。

**Tech Stack:** Chrome Extension Manifest V3, Vanilla JavaScript, Chrome APIs (storage, action)

---

### Task 1: manifest.json を作成

**Files:**
- Create: `manifest.json`

**Step 1: manifest.json を書く**

```json
{
  "manifest_version": 3,
  "name": "Calm Enter",
  "version": "1.0.0",
  "description": "AIチャットで Enter = 改行、Cmd+Enter = 送信に変更する",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "*://claude.ai/*",
    "*://chatgpt.com/*",
    "*://gemini.google.com/*",
    "*://www.perplexity.ai/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://claude.ai/*",
        "*://chatgpt.com/*",
        "*://gemini.google.com/*",
        "*://www.perplexity.ai/*"
      ],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ],
  "action": {
    "default_title": "Calm Enter: ON"
  },
  "icons": {
    "48": "icons/icon-on-48.png",
    "128": "icons/icon-on-128.png"
  }
}
```

**Step 2: コミット**

```bash
git add manifest.json
git commit -m "feat: manifest.json を作成"
```

---

### Task 2: content.js を作成（キーイベント制御）

**Files:**
- Create: `content.js`

**Step 1: content.js を書く**

```js
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
```

**Step 2: Chrome にロードして手動テスト**

1. `chrome://extensions/` を開く
2. デベロッパーモード ON
3. 「パッケージ化されていない拡張機能を読み込む」で `calm-enter/` を選択
4. claude.ai を開き、以下を確認：
   - Enter → 改行が入る（送信されない）
   - Cmd+Enter → 送信される
   - 日本語入力の変換確定 Enter → 正常に変換される
   - Shift+Enter → 通常どおり動作する

**Step 3: コミット**

```bash
git add content.js
git commit -m "feat: キーイベント制御の content script を追加"
```

---

### Task 3: background.js を作成（ON/OFF トグル）

**Files:**
- Create: `background.js`

**Step 1: background.js を書く**

```js
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
  chrome.action.setTitle({
    title: next ? "Calm Enter: ON" : "Calm Enter: OFF",
  });
});
```

**Step 2: 手動テスト**

1. 拡張機能をリロード
2. ツールバーのアイコンをクリック → タイトルが「Calm Enter: OFF」に変わる
3. AIチャットで Enter → 送信される（無効化されている）
4. もう一度クリック → 「Calm Enter: ON」に戻る
5. Enter → 改行になる（有効化されている）

**Step 3: コミット**

```bash
git add background.js
git commit -m "feat: ON/OFF トグルの background script を追加"
```

---

### Task 4: アイコンを作成

**Files:**
- Create: `icons/icon-on-48.png`
- Create: `icons/icon-on-128.png`
- Create: `icons/icon-off-48.png`
- Create: `icons/icon-off-128.png`

**Step 1: アイコン画像を生成**

シンプルなアイコンを作成する。ON は鮮やかな色、OFF はグレーアウト。
Canvas API か、シンプルな SVG → PNG 変換で生成する。

**Step 2: background.js にアイコン切り替えを追加**

`chrome.action.setIcon` を ON/OFF トグル時に呼ぶ：

```js
chrome.action.setIcon({
  path: next ? "icons/icon-on-48.png" : "icons/icon-off-48.png",
});
```

**Step 3: 手動テスト**

1. 拡張機能をリロード
2. アイコンが ON の見た目で表示される
3. クリック → OFF アイコンに切り替わる
4. 再クリック → ON アイコンに戻る

**Step 4: コミット**

```bash
git add icons/ background.js
git commit -m "feat: ON/OFF アイコンを追加"
```

---

### Task 5: 全サイトで動作確認・微調整

**手順:**

1. claude.ai で確認
2. chatgpt.com で確認
3. gemini.google.com で確認
4. perplexity.ai で確認

各サイトで以下をチェック：
- Enter → 改行
- Cmd+Enter → 送信
- 日本語入力確定 → 正常
- Shift+Enter → 正常
- ON/OFF 切り替え → 正常

問題があれば content.js にサイト固有の対応を追加。

**コミット（修正があれば）:**

```bash
git add -A
git commit -m "fix: サイト固有の調整"
```
