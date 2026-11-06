# Flow Lab

我透過重寫渲染器來改善整體渲染速度，並比較 React Flow 與自繪 Canvas 的表現。開發過程使用已建立的 E2E 與單元測試約束 AI 產出，確認替換渲染器後仍符合預期功能。展示使用相同的合成資料與佈局，預設載入一萬個節點。

## 啟動

需求：Node.js 22.12+、npm 10+。

```bash
npm ci --legacy-peer-deps
npm run dev
```

本機網址：http://127.0.0.1:5174/

正式版本可使用：

```bash
npm run build
npm run preview
```

## 功能與量測

- 支援樹狀／網狀視圖、來源切換、深度限制、節點高亮、路徑聚焦及縮放。
- 切換 Canvas 與 React Flow，或按「依序比較兩版」，查看相同資料下的呈現時間。
- 點選節點與聚焦路徑會保留當下視窗；需要重新調整比例時，按「適應畫面」。

量測結果會受資料量、裝置與執行環境影響，建議在相同設定下比較。

## 錯誤回退

切換至「錯誤回退測試」頁面，點擊上方的錯誤重現按鈕，確認發生錯誤後是否自動切換至 React Flow，並可繼續操作圖形。

## 檢查與測試

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```
