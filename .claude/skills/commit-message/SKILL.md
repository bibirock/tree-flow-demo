---
name: commit-message
description: 以繁體中文 Conventional Commits 撰寫提交訊息，並列出異動檔案。
---

# 繁體中文 Commit 規範

本版依使用者指定的既有提交格式整理，移除原專案的工作單、來源識別、效能數據及 adapter 相依。

## 結構

```text
<type>: [scope] <繁體中文描述>

[必要的原因與驗證]

異動檔案:
- 新增 路徑/檔案
- 修改 路徑/檔案
- 刪除 路徑/檔案
- 重新命名 舊路徑 → 新路徑
```

- type 與 scope 使用英文小寫；描述、本文與異動說明使用繁體中文。
- type 選擇 feat、fix、docs、style、refactor、perf、test、adjust、ci 或 revert。
- scope 放在冒號後方括號內。
- 描述一行、不加句號；不同目的拆成不同提交。
- 只有實際工作單流程提供子任務 ID 時才用 `type(ID):`；此展示沒有工作單，省略 ID，不自行編造。
- 提交前檢查差異，執行相應測試；透過 Husky 格式化暫存檔案並執行 ESLint。
- 不將原工作專案的資料識別、實際資料規模或未驗證的效能數字寫進提交。

## 範例

```text
feat: [graph] 新增合成資料的關聯路徑高亮

異動檔案:
- 新增 src/domain/graph.ts
```
