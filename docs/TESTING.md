# 驗收紀錄

驗收日期：2026 年 11 月 6 日。

## 自動化

- ESLint：零錯誤、零警告；包含 React hooks 與 refresh 規則。
- 單元測試：26 項通過。涵蓋固定資料、節點完整性、階層與重疊、上下游走訪、循環、篩選、狀態競態、最小字級與主題共用、視窗計算。
- TypeScript 與 production build：通過。
- Playwright E2E：20 項通過，Chromium、單 worker、無重試。

兩個渲染器使用同一組載入、選取高亮、聚焦、深度、來源與視圖往返情境；另外檢查 Canvas 真實命中與縮放、通用大型合成資料、手機版、共用 layout、導覽高亮、兩版依序量測、視窗保留、預設資料量、字級、線寬與 loading 先呈現。

錯誤測試分別觸發元件渲染與非同步繪圖錯誤，確認自動切到 React Flow、保留節點、仍可選取、只記錄一次成功回退，並能重新正常載入 Canvas。故意觸發的錯誤是此情境的預期事件，不視為正常流程應為零的 console error。

## 真實瀏覽器操作

使用 Computer Use MCP 的 Playwright 介面在內建瀏覽器與 Chrome 操作，確認比較紀錄、高亮、路徑聚焦、精簡介面及樣式。另在 `/fallback-test` 實際觸發非同步錯誤，畫面顯示已自動切至 React Flow 並保留圖形。

沒有把本聊天描述成已連接新設定的獨立 Playwright MCP server；持續驗證的 spec 由 Playwright Test runner 執行，真人操作式驗收由現有 Computer Use 工具完成。

## Hooks

Husky pre-commit 已在實際提交時執行 lint-staged，先格式化暫存檔案，再跑相應 ESLint 檢查。

Codex hook 使用專案內 `.codex/hooks.json`，觀察修改工具與 shell 結束後的變動程式檔；快取成功檢查的內容雜湊，避免沒有變動時重複執行。驗證時先通過正常檔案，再故意建立未使用變數，收到 block 回報，移除該測試檔後恢復通過。

依官方規則，專案與 hook 的目前定義須先獲信任。請在以此資料夾開啟的 Codex 工作階段檢視／信任 hook；CLI 可使用 `/hooks`。本專案不自動代替使用者寫入信任雜湊。

- [Codex hooks 官方說明](https://learn.chatgpt.com/docs/hooks)
- [Codex 專案 MCP 設定](https://learn.chatgpt.com/docs/extend/mcp)

## 邊界

測試通過只支持已涵蓋情境，不是完整正式上線保證。特別是主執行緒卡死、記憶體不足或分頁崩潰，不一定能由 JavaScript 例外處理恢復。效能數字應在相同環境多次觀察，不把開發環境單次結果當作普遍加速保證。
