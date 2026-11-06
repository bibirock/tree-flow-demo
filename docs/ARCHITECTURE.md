# 專案結構與設計選擇

```text
src/
  app/App.tsx                     # React Router 路由
  layouts/
    AppLayout.tsx                 # 共用外框、導覽高亮、Outlet
    ExperimentLayout.tsx          # 共用設定、渲染器頁籤、圖形操作區
  components/graph/
    ExperimentSettings.tsx
    GraphViewport.tsx
    renderers/                    # Canvas、React Flow、錯誤邊界、索引、視窗
  hooks/useGraphExperiment.ts     # 單一實驗實例的操作與量測生命週期
  state/
    graphExperimentReducer.ts     # 功能內狀態轉換
    types.ts
  design/tokens.ts
  domain/graph.ts
  pages/
    graph-comparison/             # 比較頁與專用指標、量測表
    fallback-test/                # 錯誤模擬控制；不顯示指標或量測表
  styles/app.css
```

兩頁組合相同的 ExperimentLayout，沒有複製設定或渲染器元件。AppLayout 透過 Outlet 顯示目前頁面，NavLink 同時提供 active 樣式與 aria-current。應用程式內部 import 使用 `@/` 指向 src；設定與測試工具具有相同的解析規則，ESLint 阻止 src 再加入相對模組引用。

## Tokens 與樣式

Tailwind v4 以 Vite plugin 建置，透過 `@config` 明確載入使用者要求的 `tailwind.config.ts`。主色、語意色票、字型與字級集中設定，元件的 active／disabled／loading 樣式使用 Tailwind。共用 tokens 也供 Canvas 讀取，避免 CSS 與畫布各自維護一份色票。最小基準字級為 14px。

React Flow 的節點外框與連線會依 zoom 補償線寬，與 Canvas 螢幕空間的線條粗細對齊；字型、色彩、圓角及文字細節門檻一致。不同繪製後端仍可能有抗鋸齒差異。

## 狀態與 store 判斷

功能狀態由 `useReducer` 管理：圖資料、目前渲染器、選取、聚焦、執行代號、階段與結果。設定草稿與已載入圖資料有不同語意，因此分開。路徑與可見節點由現有狀態推導；頁籤顯示留在結果元件。

計時、排程、錯誤去重與已套用設定快照保存在 ref，不觸發無意義重繪。Canvas 空間索引按圖資料參照建立，選取時重用；平移與縮放留在渲染器。

兩個路由各自建立一個獨立實驗實例，目前沒有跨頁共享或多元件全域訂閱需求，故不引入 Redux／Zustand。若後續加入跨頁工作階段或多視窗共享，再評估有選擇器的 store，避免只因「正式專案」而增加全域狀態。

## loading 與錯誤

狀態分為 idle、preparing、rendering。點擊先更新目標頁籤與 loading，再透過 animation frame 與後續 task 讓瀏覽器取得繪製提示的機會。此安排不會消除底層同步工作的成本，因此不宣稱能保證所有裝置持續流暢。

回退共用已載入資料與已套用設定，不以尚未載入的設定草稿重建另一份圖。元件錯誤與非同步繪圖錯誤分別捕捉；舊執行的完成回呼會被忽略；備援再次失敗時停止自動切換。

## 參考

- [React 狀態結構](https://react.dev/learn/choosing-the-state-structure)
- [React reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [React 自訂 hook](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Tailwind Vite plugin](https://tailwindcss.com/docs/installation/using-vite)
- [Tailwind config 相容載入](https://tailwindcss.com/docs/functions-and-directives)
