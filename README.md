# community.cce.tw Lite

> 氣候變遷教育教師社群平台 — **靜態化輕量版**
>
> 100% 視覺繼承自 [community_cce_tw](../community_cce_tw),但**移除所有需要憑證的後端**:
>
> - ✅ Next.js (靜態匯出) + GitHub Pages
> - ✅ Google Form 收 remix 提交 (取代 Firebase + Octokit)
> - ✅ Google Sheet 審核 (取代 Admin 後台)
> - ✅ 0 個 long-lived secret · 0 張綁定信用卡

## 為什麼有這個專案

詳見 [PLAN.md](PLAN.md)。一句話: 教案是靜態的、月 remix < 50 件,沒理由用動態後端。

## 資料夾結構

```
community_cce_tw_lite/
├── PLAN.md                    ← 完整規劃書
├── README.md                  ← 本文件
├── web/                       ← Next.js 網站 (npm 工作目錄)
├── scripts/                   ← Build-time 資料抓取腳本
├── forms/                     ← Google Form / Sheet 設定文件
├── docs/                      ← 維護者文件 + 架構圖 + 資安基線
└── .github/workflows/         ← GitHub Actions 自動部署
```

## 30 秒快速開始 (本地開發)

```bash
cd community_cce_tw_lite/web

# 安裝
npm install

# 設定環境變數 (Google Form URL 等)
cp .env.local.example .env.local
# 編輯 .env.local 填入 NEXT_PUBLIC_FORM_URL 等

# 抓教案資料 + 啟動 dev server (predev hook 會自動跑 build script)
npm run dev
# → http://localhost:3000
```

## 部署到 GitHub Pages

1. 把 `community_cce_tw_lite/` 推到一個 GitHub repo (建議 `community-cce-tw-lite` 或直接覆寫舊的 `community-cce-tw`)
2. Settings → Pages → Source: **GitHub Actions**
3. Settings → Secrets and variables → Actions → **Variables** 新增:
   - `NEXT_PUBLIC_FORM_URL`
   - `NEXT_PUBLIC_FORM_ENTRY_KEY_ID`
   - `CUSTOM_DOMAIN` = `community.cce.tw` (若已設好 DNS)
4. push 到 main → GitHub Actions 自動 build & deploy
5. CNAME 指向 `<github-username>.github.io`

## 維護者必讀

- [docs/MAINTAINER_GUIDE.md](docs/MAINTAINER_GUIDE.md) — 30 分鐘上手
- [docs/SECURITY.md](docs/SECURITY.md) — 資安基線
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 架構圖
- [forms/review_workflow.md](forms/review_workflow.md) — 審核 SOP

## 已知限制 (Phase 0 接受)

- 改編家族樹 (FamilyTree) 改成簡單列表 → Phase 1 再升級
- 討論區改成「→ GitHub Discussions」連結
- 改編顯示有 ~7 天延遲 (週結合 PR)
- 教案內容更新仍即時 (push → 5 分鐘上線)

## 與舊版 community_cce_tw/ 的關係

舊版完整保留在 `../community_cce_tw/`,作為 Phase 1 升級回動態後端時的參考實作。
本 Lite 版的所有 Google Sheet / Form 資料皆可 export CSV → 無 vendor lock-in。
