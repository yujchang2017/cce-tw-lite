# Google Sheet 欄位規格 (v2 — 改編 / 試教 分流版)

連動 Google Form 後,Sheet 自動產生對應欄位。以下是建議的最終欄位順序。

## 自動產生 (由 Form 提交)

| 欄位 | 來源 | 範例 |
|---|---|---|
| 時間戳記 | Form 自動 | 2026-04-23 14:30 |
| 電子郵件地址 | Form 驗證 | teacher@school.edu.tw |
| 教案編號 | Form (預填) | 1.1-III |
| 老師姓名 | Form | 王小明 |
| 學校 / 機構 | Form | 臺北市立大學附小 |
| 任教縣市 | Form | 臺北市 |
| 任教年段 | Form | 國小高年級 |
| **提交類型** | Form (Q6) | A / B / C |
| 改編簡述 | Form Section 2 | (段落) |
| 改了哪些部分 | Form Section 2 | 教學活動, 數據資料 |
| 為什麼這樣改 | Form Section 2 | (段落) |
| 改編後的教案檔 | Form Section 2 | https://drive.google.com/... |
| 期望解決什麼問題 | Form Section 2 | (段落) |
| 學生人數 | Form Section 3 | 28 |
| 試教日期 | Form Section 3 | 2026-04-15 |
| 學生反應 | Form Section 3 | (段落) |
| 教學省思 | Form Section 3 | (段落) |
| 試教照片 | Form Section 3 | https://drive.google.com/... |
| 學生作品 | Form Section 3 | https://... |
| 授權同意 | Form | 是 |
| 肖像權同意 | Form | 「已取得肖像權」/「無相關照片」 |
| 個資同意 | Form | 是 |

## 人工新增欄位 (審核用)

| 欄位 | 用途 | 值 |
|---|---|---|
| **狀態** | 審核狀態 | `pending` / `approved` / `rejected` / `needs-revision` |
| **審核員** | 誰審的 | 姓名或 email |
| **審核日期** | 完成審核日 | 日期 |
| **審核備註** | 公開回饋 (寄給老師) | 文字 |
| **內部備註** | 不公開 | 文字 |
| **PR 連結** | 合併到主庫的 PR | https://github.com/.../pull/123 |
| **發布日期** | 改編出現在網站的日期 | 日期 |

## 條件式格式建議

### 狀態欄
- pending → 黃底
- approved → 綠底
- rejected → 紅底
- needs-revision → 橘底

### 提交類型欄 (新加)
- A (只改編) → 淡綠底
- B (只試教) → 淡藍底
- C (改編+試教) → 金黃底 ⭐

## 審核員 SOP

詳見 [review_workflow.md](review_workflow.md)
