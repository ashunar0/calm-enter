# Calm Enter — 設計ドキュメント

## 概要

AIチャットサイトで Enter キーによる誤送信を防ぐ Chrome 拡張機能。
Enter を改行に、Cmd+Enter（Mac）/ Ctrl+Enter（Windows）を送信に変更する。

## 対象サイト

- claude.ai
- chatgpt.com
- gemini.google.com
- www.perplexity.ai

（後から追加可能）

## ファイル構成

```
calm-enter/
├── manifest.json       # Chrome拡張 Manifest V3
├── content.js          # キーイベント制御（メインロジック）
├── background.js       # ON/OFF状態管理
├── icons/
│   ├── icon-on-48.png  # 有効時アイコン
│   └── icon-off-48.png # 無効時アイコン
└── docs/plans/
```

## 技術アプローチ

Content Script + capture phase イベント制御を採用。

### 選定理由

- 最もシンプル。1ファイルの content script で完結する
- 主要AIサイトはほぼカバーできる
- debugger API（やりすぎ）やDOM操作（メンテコスト高）と比較して最適

## キーイベント制御（content.js）

capture phase で keydown をキャッチし、以下の判定を行う：

```
Enter かつ Cmd/Ctrl なし？
  ├─ YES → preventDefault + stopPropagation → 改行を挿入
  └─ NO → そのままスルー（サイト側のハンドラに任せる）
```

### 判定ロジック

```js
if (e.key === 'Enter'
    && !e.metaKey && !e.ctrlKey  // Cmd/Ctrl+Enterは送信として通す
    && !e.shiftKey               // Shift+Enterも通す
    && !e.isComposing            // IME変換中は触らない
) {
  e.preventDefault();
  e.stopPropagation();
  document.execCommand('insertLineBreak');
}
```

### 重要なポイント

- **capture phase** で登録してサイト側より先にイベントを捕まえる
- **`document.execCommand('insertLineBreak')`** で改行挿入（contenteditable要素で最も確実）
- **Shift+Enter はスルー**（既存の改行挙動を壊さない）
- **`e.isComposing` チェック**で日本語IME変換確定のEnterをブロックしない

## ON/OFF 切り替え（background.js）

- `chrome.storage.local` に `{ enabled: true/false }` を保存
- デフォルトは ON（インストール直後から有効）
- ツールバーアイコンクリックでトグル
- `chrome.action.setIcon` でON/OFFを視覚的に切り替え
- content.js は `chrome.storage.onChanged` で状態変更をリアルタイム検知

## 権限（最小限）

```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "*://claude.ai/*",
    "*://chatgpt.com/*",
    "*://gemini.google.com/*",
    "*://www.perplexity.ai/*"
  ]
}
```
