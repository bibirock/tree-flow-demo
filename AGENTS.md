# Flow Lab 開發規範

## 目標與邊界

本專案是獨立的 React + TypeScript 展示，以合成資料比較 React Flow 與自繪 Canvas，另提供錯誤回退測試。以可維護的正式專案標準組織程式，不引入與展示無關的服務或功能。

- 不修改、複製或引入其他工作專案的程式、資料集、業務名稱、內部網址、工作單與實際資料規模。
- 使用可重現的合成資料，預設一萬節點；兩種渲染器使用相同資料、座標、尺寸與關聯邏輯。
- 不預設 Canvas 必定比較快，不製造固定延遲或預填成果；歷史經驗與本次量測分開。

## 技術基底與指令

React、TypeScript strict、Vite、React Router、Tailwind CSS、ESLint、Prettier、Vitest、Playwright、Husky、lint-staged。

```bash
npm ci --legacy-peer-deps
npm run dev
npm run lint
npm test
npm run build
npm run test:e2e
npm run format:check
```

預設本機網址為 `http://127.0.0.1:5174/`；正式量測使用 build 與 preview。新增依賴先確認是否真的需要，更新 package.json 與 lockfile。

## 專案結構

```text
src/
  app/App.tsx                   # 路由入口
  layouts/
    AppLayout.tsx               # 共用外框、NavLink 高亮、Outlet
    ExperimentLayout.tsx        # 共用圖形設定、頁籤與操作區
  pages/
    graph-comparison/           # 比較頁；專屬指標與量測表
    fallback-test/              # 錯誤模擬頁；不放比較指標與量測表
  components/graph/             # 兩頁共用的設定、圖形視窗
    renderers/                  # 渲染器、錯誤邊界、索引、視窗計算
  hooks/useGraphExperiment.ts   # 單一實驗的操作與生命週期
  state/                       # 功能狀態 reducer 與型別
  domain/graph.ts               # 純資料、佈局、走訪與篩選
  design/tokens.ts              # CSS 與 Canvas 共用 tokens
  styles/app.css                # Tailwind 樣式與必要覆寫
```

- 頁面只組合該頁需要的區塊；兩頁相同的設定、圖形與互動必須共用，不能複製一份到每個頁面。
- 共用 layout 組合共用元件；AppLayout 用 Outlet 切換頁面，導覽以 active 樣式與 aria-current 表示目前位置。
- 頁面專屬元件留在頁面目錄；純工具不包成 hook；不要建立沒有實際責任的薄包裝。

## 引用與型別

- 應用程式內部 import 一律使用 `@/` 指向 src，不使用 `./` 或 `../`。
- TypeScript、Vite 與 Vitest 的 alias 必須一致；ESLint 阻止 src 新增相對模組引用。
- 工具設定檔與 CSS 資源載入可使用工具要求的相對路徑；不要為了改寫路徑破壞 Tailwind config 載入。
- 避免 any、非必要型別斷言及關閉檢查規則。修正原因，不用註解略過 ESLint 或型別問題。

## 樣式與可及性

- 透過 Tailwind config 設定主色、語意色、字型與字級，與 Canvas 共用 design tokens；避免在元件或繪圖流程散落色碼與字級。
- 最小基準字級 14px，包含按鈕、提示、表格、導覽及圖形標籤；圖形仍依視窗 zoom 縮放。
- React Flow 與 Canvas 的節點、線條、色彩、文字門檻和全圖適應盡量一致；量測不得因兩版功能不同而誤導。
- 保留 Flow Lab 名稱及實際操作區，不新增側邊欄、麵包屑、宣傳文案或裝飾圖示。
- 為表單、按鈕、loading 與錯誤提示提供可識別名稱與適當語意；提供鍵盤可操作的節點選單。

## React 與狀態管理

- render 保持純粹；計時、排程、DOM、繪圖與其他副作用放在事件或 effect。
- reducer 管理需要一起更新的圖資料、渲染器、選取、聚焦、階段與量測結果，避免矛盾狀態。
- 路徑、可見節點與統計由既有資料推導，不另存重複 state。局部顯示狀態留在使用它的元件。
- ref 只保留計時、資源、排程與不需觸發畫面的值；不要在 render 中修改 ref。
- 先判斷是否需要 store。目前各頁各自擁有一個實驗，沒有跨頁共享需求，不引入額外全域 store；需求改變時再評估訂閱範圍與清理策略。
- 大型資料索引依圖資料建立，選取時重用；不要因高亮重新建立所有索引或不必要地重設視窗。
- effect 的 listener、ResizeObserver、animation frame、timer 必須清理；完成回呼要驗證執行代號，避免過期結果污染新狀態。

## 互動與錯誤處理

- 點選與路徑聚焦保留縮放和平移；只有載入新資料或明確按適應畫面時重新調整。
- 點頁籤先更新目標狀態與 loading，再安排重工作。進度不確定時使用 indeterminate bar，不編造百分比。
- 元件渲染錯誤用 Error Boundary；非同步繪圖錯誤在回呼中捕捉並回報，不能假設 boundary 或外層 try/catch 能捕捉所有事件。
- Canvas 可捕捉錯誤時切到 React Flow，使用同一份已載入資料與設定。每次錯誤只處理一次；備援再次失敗時停止循環重試。
- 錯誤維持頁面內提示，不加彈窗。錯誤頁不顯示比較指標或量測紀錄。
- 不宣稱例外處理能恢復主執行緒卡死、記憶體不足或分頁崩潰。
- 不新增 JSON 匯出或使用者已移除的功能。

## 測試與驗收

- 先建立既有行為基準，再改渲染器或重構；兩版共用相同情境。
- 單元測試涵蓋資料完整性、階層、重疊、循環、路徑、篩選、狀態競態與設計契約。
- E2E 涵蓋兩版載入、高亮、聚焦、深度、來源、視圖往返、大量合成資料、視窗保留、loading、導覽及錯誤回退。
- 不以固定加速倍數或脆弱的 sleep 驗收；優先等待可觀察狀態。Canvas 命中測試要有確定性座標或可及性操作。
- 修改 UI 後除了自動化測試，也用 Computer Use／可用的瀏覽器 MCP 實際操作並檢查畫面；不能只用測試通過替代視覺驗收。
- 只報告實際執行的檢查與結果；配置了 MCP 不代表已連線，配置了 hook 不代表已獲信任並自動生效。

## 自動檢查與提交

- Codex PostToolUse hook 檢查變動程式檔的 ESLint，內容相同時可用成功雜湊快取；不自動替使用者信任 hook。
- Husky pre-commit 使用 lint-staged 格式化暫存檔案並執行 ESLint。不略過 hook，不順便修改無關檔案。
- 使用 `.claude/skills/commit-message/SKILL.md` 的繁體中文 Conventional Commits，footer 列出異動檔案。
- 按可理解的功能、重構、測試、工具或文件範圍分批提交，避免長時間累積不相關變更。
- 標題描述實際交付內容，不包含對話紀錄、來源資料識別、未驗證的效能數據或工作單。
- Git 歷史重整須有使用者授權與可回復備份；不得改動其他專案或未授權的遠端紀錄。
