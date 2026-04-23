# Google Form 規格 (v2 — 改編 / 試教 分流版)

> 本文件是給工程師與長期維護者看的「為什麼這樣設計」紀錄。
> 給同事建表單看 → [form_checklist_for_helper.md](form_checklist_for_helper.md)

## 設計決策

### 為什麼把改編 / 試教分開?

| 情境 | 性質 | 收的資料不同 |
|---|---|---|
| 只改編 | 文件層面修改 (還沒進教室) | 改了什麼 + 為什麼改 |
| 只試教 | 課堂實作 (沒改原版) | 學生反應 + 教學省思 + 照片 |
| 改編 + 試教 | 完整循環 (含金量最高) | 全部 |

只用一張「改編」表單會強迫「只試教」的老師捏造改編內容,降低資料品質。

### 為什麼用一張表單而非兩張?

- 老師只要記一個入口
- Sheet 用同一張(多一欄「類型」過濾)
- 審核 SOP 一套

### 為什麼 Section 3 全部設「非必填」?

Google Form 的「前往區段」功能可以跳過區段,但無法依答案動態改變欄位的「必填屬性」。

折衷方案:全設非必填 → 審核員依 Q6「提交類型」把關。

## 欄位 → Sheet 欄位對照

詳見 [sheet_columns.md](sheet_columns.md)

## entry ID 取得方式

見 [form_checklist_for_helper.md](form_checklist_for_helper.md) §7

## 共用權限

- **Form**: 任何人皆可填
- **Sheet** + **Drive 上傳資料夾**: 只有負責人 + 1-2 位審核員可見
- **絕對不要**設「擁有連結即可編輯」

## 升級 Phase 1 時的遷移考量

把 Form/Sheet 換成 Next.js 動態表單時,要保留三個提交類型分流邏輯。
資料 schema 在 Phase 0 設計時就已經支援(submitType 欄位),不需要改 DB。
