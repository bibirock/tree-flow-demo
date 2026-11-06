# Flow Lab

獨立撰寫的 React + TypeScript 圖形渲染展示，以同一份合成資料、固定佈局與關聯邏輯比較 React Flow 和 Canvas。預設載入一萬個合成節點，不使用原工作專案的程式、業務資料或實際資料規模。

## 啟動

需求：Node.js 22.12+、npm 10+。

```bash
npm ci --legacy-peer-deps
npm run dev
```

本機網址：http://127.0.0.1:5174/

- `/`：圖形渲染比較。
- `/fallback-test`：錯誤回退測試。使用較小的合成資料驗證功能，不拿舊版的大圖瓶頸混淆錯誤捕捉的結果。

正式比較可使用：

```bash
npm run build
npm run preview
```

## 功能與量測

- 樹狀／網狀視圖、合成來源切換、深度限制、節點選取與關聯高亮、路徑聚焦、縮放和平移。
- 點選或聚焦保留視窗；重新載入或按「適應畫面」才重新計算比例。
- 點擊渲染器頁籤先更新頁籤與 loading，再安排資料與元件工作。進度列不宣稱可量測的完成百分比。
- 「依序比較兩版」使用相同設定，依序掛載兩個渲染器，結果顯示於表格，不提供 JSON 匯出。
- 所有節點資料都是可重現的合成資料。來源 B 改變根標籤但保持結構；網狀圖增加跨支連線，不重現原業務的資料合併。
- 超大圖適應全圖後可能縮成細線，可用縮放與平移探索。

準備時間是合成資料、固定佈局及初始篩選的成本。操作至圖形呈現從點擊開始，包含 loading 排程、準備與渲染，到渲染器就緒後下一幀。這是主執行緒可觀察的代理值，不保證 GPU 顯示完成。最大幀間隔是期間的 animation frame 取樣，不是完整卡頓或崩潰偵測。

不製造固定等待、不預填歷史成果、不預設 Canvas 一定比較快。比較時應使用相同資料、深度、視窗、可見範圍渲染選項與 production 模式，重複觀察。選取、聚焦及縮放不自動新增量測紀錄。

## 錯誤回退

正常比較頁與測試頁共用同一套處理：Error Boundary 捕捉 Canvas 元件渲染錯誤，非同步繪製回呼另行捕捉錯誤並回報。發生錯誤後立即切至 React Flow 的 loading，使用同一份已載入圖資料恢復操作。

同一次失敗只處理一次。若備援渲染器也失敗，停止自動重試並顯示錯誤；不來回循環。這處理可捕捉的錯誤，無法保證在主執行緒卡死或分頁崩潰時執行。對大型資料的正式發布，仍需另外規劃資料量限制與回退門檻。

## 檢查與測試

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

目前通過 26 項單元測試及 20 項 Playwright E2E。實際瀏覽器操作、測試方法與限制見 `docs/TESTING.md`。

## 工程規範

- 兩頁位於 `src/pages/`，共用版型位於 `src/layouts/`，共用操作元件位於 `src/components/graph/`。React Router 保留共用外框並高亮目前頁面；錯誤頁沒有指標列與量測紀錄。應用程式引用統一使用 `@/`，TypeScript、Vite、Vitest 與 ESLint 同步設定。
- `tailwind.config.ts` 建立主色及語意色彩／字型設定，`src/design/tokens.ts` 同時供 Tailwind 與 Canvas 使用。最小基準字級為 14px；圖形本身仍會隨縮放變大或變小。
- 功能狀態集中在 reducer 與協調 hook，衍生資料不重複存為 state。沒有跨頁共享需求，因此不引入額外全域 store。
- Husky 在 commit 前使用 lint-staged 格式化暫存檔案並跑 ESLint；只格式化本次提交內容。
- `.codex/hooks.json` 提供修改後 ESLint 檢查，`scripts/lint-after-edit.mjs` 已測試正常與失敗路徑。Codex 載入並信任此專案的 hook 定義後才會自動執行；目前聊天的工作目錄不是此新專案，不能宣稱已在本聊天自動啟用。
- `.codex/config.toml` 提供 Codex 的 Playwright MCP 設定，`.mcp.json` 提供相容客戶端格式。它們不等於本聊天已連上新的 MCP server；本次真實 UI 驗收使用現有 Computer Use MCP 的 Playwright 介面。

## 文件

- `交付說明.md`：逐題問答、過往經驗與本次展示範圍。
- `docs/ARCHITECTURE.md`：頁面結構、tokens 與狀態歸屬。
- `docs/TESTING.md`：驗收與 hook／MCP 啟用方式。
- `docs/PRIVACY.md`：獨立實作與來源資訊檢查。

此展示不含原業務檔案匯入、跨來源分析、後端、正式監控平台或分批發布系統。未將未實作的規劃寫成已完成。
