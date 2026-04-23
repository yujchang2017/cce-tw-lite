# 維護者指南 — 30 分鐘上手

> ⚠️ **未完成的技術債 (2026-04 由創辦人記錄)**
>
> 目前 Phase 0 上線時 Google Form / Sheet 是用**創辦人個人帳號**建立(為了加速啟動)。
> 必須在以下任一條件達成前完成「轉移到 community-cce-tw@gmail.com 共用帳號」:
> - 第一位接手維護者出現
> - 累積提交 ≥ 30 筆
> - 上線滿 6 個月
>
> 轉移 SOP 見本文件 §6「Form/Sheet 帳號轉移」。

## 你只需要做的事

| 頻率 | 任務 | 工具 | 工時 |
|---|---|---|---|
| 每天 | 看 Discord 通知有無新提交 | 手機 | 2 分鐘 |
| 每週一 | 審核新提交 (5-10 件) | Google Sheet | 1.5 小時 |
| 每週一 | 跑 weekly-merge 合併到主庫 | terminal | 30 分鐘 |
| 每月底 | 結算徽章 + 寄通知 | Google Sheet + 手動 | 30 分鐘 |
| 教案內容變動 | push 到 cce-teaching-packages → 自動上線 | git | 0 維護 |

## 第一次接手 checklist

### 1. 取得權限

- [ ] 加入 community-cce-tw@gmail.com 共用帳號 (向前任要密碼或 2FA backup code)
- [ ] 加入 GitHub yujchang2017/community-cce-tw repo collaborator
- [ ] 加入 yujchang2017/cce-teaching-packages repo collaborator
- [ ] 加入維護者 Discord/LINE 群組

### 2. 確認部署狀態

- [ ] 開 https://community.cce.tw → 應正常顯示 136 包
- [ ] 隨機點 1 個教案 → 詳情頁載入正常
- [ ] 點「我要改編」→ Google Form iframe 載入正常
- [ ] 提交一筆測試資料 → 確認 Discord 收到通知 + Sheet 出現新列

### 3. 本機開發環境

```bash
git clone https://github.com/yujchang2017/community-cce-tw.git
cd community-cce-tw/web
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 Google Form URL
npm run dev
```

### 4. 申請自己的 fine-grained PAT (合 PR 用)

1. https://github.com/settings/personal-access-tokens/new
2. Repository access: **Only select repositories** → `cce-teaching-packages`
3. Permissions:
   - Contents: Read and write
   - Pull requests: Read and write
4. Expiry: 90 days
5. **永遠不要** commit 此 token、不要貼到 chat、不要存桌面 .txt

## 常見問題

### 教案內容 push 了但網站沒更新?

1. 看 Actions 是否在跑: https://github.com/yujchang2017/community-cce-tw/actions
2. 若失敗 → 點進去看 log,通常是 build script timeout
3. 手動觸發 redeploy: Actions → Build & Deploy → Run workflow

### 審核員看不到 Sheet?

→ 用 community-cce-tw@gmail.com 登入 → Sheet 分享設定 → 加 email 為「編輯者」

### 老師反映 Form 載入不出來?

1. 開瀏覽器 DevTools → Console 看錯誤
2. 通常是 iframe X-Frame-Options 問題 → 確認 Form 是「公開可填」設定
3. 若 NEXT_PUBLIC_FORM_URL 變動 → 在 GitHub Variables 更新後重新觸發 deploy

### 想升級回動態後端 (Phase 1)?

詳見 [PHASE_1_ROADMAP.md](PHASE_1_ROADMAP.md)。**先確認觸發條件**:
- 月 remix > 100 件 (連續 3 月)
- Ambassador > 200 人
- ≥ 20 則「Form 體驗差」的具體回饋
- 找到第 3 位以上長期工程師夥伴

否則維持靜態化,把工程力投在「招募 ambassador / 推廣到學校」。

## 6. Form/Sheet 帳號轉移 (個人帳號 → 共用帳號)

> 在 Phase 0 啟動期,Form/Sheet 暫時建在創辦人個人 Google 帳號下。
> 此 SOP 用於將擁有權轉到 community-cce-tw@gmail.com,確保長期可交接。

### 前置作業

1. 建立並登入 community-cce-tw@gmail.com (開 2FA、備援手機填好)
2. 列出目前個人帳號下與專案相關的所有資產:
   - [ ] Google Form (氣候變遷教案改編提交)
   - [ ] Google Sheet (Form 連動的回應試算表)
   - [ ] Google Drive 資料夾「氣候變遷教案改編提交 (檔案回應)」(老師上傳的照片自動存放處)
   - [ ] Apps Script 專案 (notify trigger)

### 轉移步驟 (預估 20 分鐘)

#### Form
1. 開 Form 編輯頁 → 右上 ⋮ → **新增協作者** → 加 community-cce-tw@gmail.com 為「編輯者」
2. **重要**: Google Form 沒有「轉讓擁有者」按鈕,但可以做以下兩種方式擇一:
   - **方案 A (推薦,簡單)**: 共用帳號變編輯者後,個人帳號保留為擁有者直到下次大改版,屆時用共用帳號**另存複本**取代舊 Form,並更新網站 `NEXT_PUBLIC_FORM_URL`
   - **方案 B (Workspace)**: 若升級成 Google Workspace 網域,可用 admin console 強制轉讓

#### Sheet
1. 開回應 Sheet → 右上「共用」 → 加 community-cce-tw@gmail.com 為「編輯者」
2. 點擁有者旁的下拉選單 → **設為擁有者** → 確認
3. 完成後個人帳號自動降為「編輯者」

#### Drive 資料夾 (上傳檔)
1. 同 Sheet 步驟轉讓擁有權

#### Apps Script
1. 開 script.google.com → 開該專案 → 右上「共用」 → 加共用帳號為編輯者
2. Apps Script 也沒有「轉讓擁有者」,但 trigger 是綁定 Sheet 的,Sheet 轉讓後 trigger 自動跟著新擁有者跑

### 轉移後驗證

- [ ] 用個人帳號登出,改用共用帳號登入
- [ ] 提交一筆測試 Form
- [ ] 確認 Sheet 收到資料,trigger 寄出通知信
- [ ] 確認檔案上傳到 Drive 資料夾
- [ ] 在 [SECURITY.md](SECURITY.md) 的「事件回應」清單把舊個人帳號從 incident-response 流程移除
- [ ] 撕掉 [MAINTAINER_GUIDE.md](MAINTAINER_GUIDE.md) 開頭的「未完成的技術債」警語
