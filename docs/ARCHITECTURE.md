# 架構圖 — community.cce.tw Lite

## 一頁總覽

```
┌─────────────────────────────────────────────────────────────────┐
│                    教師 / 一般訪客瀏覽器                          │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Pages (community.cce.tw)                     │
│              CDN cached · 100% 靜態 HTML/JS/JSON                 │
│              · 136 個預先產生的教案詳情頁                         │
│              · ~500KB packages.json 整包前端搜尋                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │ (老師按「我要改編」)  │ (build time)         │
        ↓                     ↓                      ↓
┌──────────────────┐ ┌─────────────────────┐ ┌──────────────────────┐
│  Google Form     │ │  GitHub Actions     │ │  GitHub Pages CDN    │
│  iframe          │ │  (build job)        │ │  (即時 cache)         │
│  · 4 sections    │ │  · fetch _index     │ │                      │
│  · 檔案上傳      │ │  · fetch 136 詳情   │ │                      │
└──────────────────┘ └─────────────────────┘ └──────────────────────┘
        │                                                ↑
        ↓                                                │
┌──────────────────┐                          ┌──────────────────────┐
│  Google Sheet    │  ←──── Apps Script ───→  │   email/Discord      │
│  · 自動同步      │       · onFormSubmit     │   · 通知審核員       │
│  · 人工審核欄位  │       · sendResult       │                      │
└──────────────────┘                          └──────────────────────┘
        │ (人工審 → 標 approved)
        ↓
┌──────────────────────────────────────────────────────────────────┐
│  維護者本機 weekly-merge.mjs (每週手動跑)                         │
│  · 讀 Sheet → download 老師上傳檔                                 │
│  · 用 fine-grained PAT 開 PR → 人工 merge                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  cce-teaching-packages repo (public, GitHub)                     │
│  · 136 個教案 + 改編內容                                          │
│  · push → 觸發 community-cce-tw 重 build → 5 min 上線             │
└──────────────────────────────────────────────────────────────────┘
```

## 資料流時效

| 場景 | 時效 |
|---|---|
| 教案內容更新 (你 push) | **5 分鐘** 自動上線 |
| 老師收到提交確認信 | **即時** (Google Form 自動) |
| 審核員收到通知 | **即時** (Apps Script trigger) |
| 老師收到審核結果 | **1-7 天** (人工) |
| 改編顯示在「家族樹列表」 | **約 7 天** (週結合 PR) |

## 與舊架構對比

| 維度 | 舊 community_cce_tw | Lite |
|---|---|---|
| 服務數量 | 4 (Vercel + Firebase + GitHub + 信用卡) | 2 (GitHub + Google) |
| Long-lived secret | 6 個 | 0 個 |
| 月維護工時 | 4-8 hr (env/cert/pipeline) | 0.5-1 hr |
| 月成本 | $0-20 USD | $0 |
| 攻擊面 | 高 | 極低 |
| Vendor lock-in | 中 (Firestore schema) | 低 (Sheet/Form 可 export CSV) |

## 升級路徑

當 Phase 1 條件達成 ([PHASE_1_ROADMAP.md](PHASE_1_ROADMAP.md)),可逐步加回:

1. NextAuth.js + Google OAuth (僅 Auth,無 DB)
2. FamilyTree SVG (從靜態列表升級)
3. Admin 後台 (取代 Google Sheet)
4. (可選) 動態 Discussion (取代 GitHub Discussions)

每一步都不需要動到 Google Form 提交流程。
