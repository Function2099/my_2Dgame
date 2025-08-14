# 我的 2D 橫向遊戲專案

這是一款使用 Java + LibGDX 製作的 2D 橫向動作遊戲，支援瀏覽器執行，風格參考空洞騎士與九日。

## 🔧 技術架構

- Java 17
- LibGDX
- HTML5 WebGL 匯出
- VS Code 編輯 + Gradle 編譯

## 📁 資料夾結構

- `libgdx-project/`：原始 Java 專案
- `docs/`：網頁 UI 與嵌入遊戲畫面
- `docs/game/`：LibGDX 匯出的 HTML5 遊戲
- `versions/`：歷史版本備份

## 🚀 執行方式

1. 使用 `./gradlew html:dist` 匯出遊戲
2. 將匯出內容複製到 `docs/game/`
3. 開啟 `docs/index.html` 預覽網頁

## 📌 作者

趙宇玄 @ 2025


my-2d-game/
├── docs/                     ← 網頁主體（部署用）
│   ├── index.html            ← 主網頁入口
│   ├── style.css             ← 網頁樣式
│   ├── script.js             ← 網頁互動（非遊戲邏輯）
│   ├── assets/               ← 網頁用圖片、圖示
│   └── game/                 ← LibGDX 匯出的 HTML5 遊戲
│       ├── index.html
│       ├── game.js
│       ├── game.wasm
│       ├── game.data
│       └── ...
├── libgdx-project/           ← LibGDX 原始專案（Java 程式）
│   ├── core/                 ← 遊戲邏輯（Java）
│   ├── desktop/              ← 桌面版啟動器
│   ├── html/                 ← HTML5 匯出模組
│   ├── android/              ← 可選：手機版模組
│   ├── build.gradle
│   └── settings.gradle
├── versions/                 ← 歷史版本備份（手動或 Git tag）
│   ├── v1.0/
│   ├── v1.1/
│   └── ...
├── README.md                 ← 專案說明文件
├── LICENSE                   ← 授權條款（可選）
└── .git/                     ← Git 版本控制資料夾（初始化後產生）