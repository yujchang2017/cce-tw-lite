# community.cce.tw — 輕量化遷移規劃書 (方案 A · 靜態化 + Google Form)

**版本**: Lite v1.0
**撰寫日期**: 2026-04-23
**目標讀者**: 2-3 人維護團隊
**取代**: `community_cce_tw/` 的 Firebase + Octokit 自動化後端
**保留**: 100% 視覺設計 (Tailwind UI / 配色 / 字體 / Hero / Cards / Animations)

---

## 1. TL;DR (一頁摘要)

| 項目 | 現況 (community_cce_tw/) | Lite 版 (community_cce_tw_lite/) |
|---|---|---|
| 前端框架 | Next.js 16 App Router (SSR) | Next.js 16 **靜態匯出 (`output: 'export'`)** |
| 教案資料來源 | 即時打 GitHub raw API | **build-time fetch → 打包成 JSON** |
| 搜尋 / 過濾 | client-side React (已 OK) | client-side React + Fuse.js (零後端) |
| 老師改編提交 | `/api/remix` Route → Firestore + Octokit 開 PR | **Google Form (嵌入 iframe + Tally.so 備案)** |
| 審核後台 | `/admin` Next.js page + Firestore | **Google Sheet + Apps Script 通知** |
| 改編家族樹 (FamilyTree) | GraphQL refs/commits → SVG | **延後至 Phase 1** (Lite 顯示「改編列表」) |
| 討論區 (Discussion) | Firestore thread | **連到 GitHub Discussions** (零維護) |
| 徽章自動授予 | Cloud Function + Firestore | **月結手動 + 寄信通知** |
| 第三方憑證數量 | 6 個 (GitHub PAT × 2 / Firebase service account / Vercel env × 3) | **0 個 long-lived secret** |
| 部署目標 | Vercel (帳單綁卡) | **GitHub Pages (免費、無金流)** |
| 預估月維護工時 | 4-8 小時 (env / cert / pipeline 故障) | **0.5-1 小時** (僅手動審核/合 PR) |
| 預估年度成本 | NT$ 0-8,000 | **NT$ 0** (域名已有) |
| 資安攻擊面 | 高 (3 雲服務 + 2 API token + 信用卡) | **極低 (純靜態 + Google 託管表單)** |

**核心思想**: 教案是靜態的,改編流量低,**沒理由用動態後端**。把所有「需要憑證的東西」全部丟給 Google (表單) 和 GitHub (儲存)。

---

## 2. 為什麼這樣做 (決策依據)

### 2.1 流量規模 vs 架構複雜度不成比例

| 指標 | Phase 0 預估 | 現有架構假設 |
|---|---|---|
| 教案總數 | 136 包 (固定,變動極慢) | 動態 DB-backed (overkill) |
| 月活躍老師 | 50-200 人 | Firestore 並發 (overkill) |
| 月 remix 提交數 | 10-50 件 | 自動 fork+PR pipeline (overkill) |
| 同時編輯衝突 | 幾乎為零 | Firestore real-time sync (overkill) |

→ **136 包打成 ~500 KB JSON,首頁載入比 API 還快。**

### 2.2 你已踩過的坑 → 全部消失

來自 [docs/RESTART_GUIDE.md](../community_cce_tw/docs/RESTART_GUIDE.md) 「踩的坑」:

| 原坑 | Lite 版是否還會發生 |
|---|---|
| Firebase Private Key Windows 剪貼簿污染 | ❌ 不再使用 Firebase |
| GitHub PAT 權限 / 撤銷 | ❌ Build 時用 GITHUB_TOKEN (GitHub Actions 內建,無需手管) |
| ESM vs CommonJS (@octokit) | ❌ 不再用 Octokit |
| Vercel Route Handler Body Size 4.5MB | ❌ 上傳走 Google Form (15 MB/欄位) |
| Vercel Deployment Protection 401 | ❌ 改 GitHub Pages |
| `_index.json` race condition | ❌ Build pipeline 串行產生 |
| **信用卡盜刷池魚之殃** | ❌ **不綁信用卡** (GitHub Pages + Forms 全免費) |

### 2.3 視覺品質不犧牲

- 13 個 React 組件 ([components/](../community_cce_tw/app_sample/components/)) 全數保留
- Tailwind config / globals.css / 配色 (sun / earth / forest / ink / mute / sand) 全數保留
- Hero 漸層、卡片動畫、emoji mascot 全數保留
- 唯一視覺變化: Remix 表單頁從「右側徽章 panel」改成「Google Form iframe + 左側徽章說明卡」

---

## 3. 新資料夾結構

```
community_cce_tw_lite/                    ← 新建,與舊資料夾並存
├── PLAN.md                               ← 本文件
├── README.md                             ← 給接手者的 quickstart
├── MIGRATION_LOG.md                      ← 遷移過程紀錄 (可選)
│
├── web/                                  ← Next.js 靜態網站 (取代 app_sample/)
│   ├── app/
│   │   ├── page.tsx                      ← 首頁 (移植自舊 page.tsx,改讀 build-time JSON)
│   │   ├── package/[keyId]/page.tsx      ← 教案詳情 (改成 generateStaticParams)
│   │   ├── remix/[keyId]/page.tsx        ← Remix 頁 → 改成 Google Form iframe
│   │   ├── about/page.tsx                ← (新) 關於本平台
│   │   ├── how-to-contribute/page.tsx    ← (新) 改編貢獻流程說明
│   │   ├── globals.css                   ← 完整保留
│   │   └── layout.tsx                    ← 完整保留
│   ├── components/                       ← 13 個組件全數複製
│   │   ├── HomeBrowser.tsx               ← 不動
│   │   ├── KeyIdeaCard.tsx               ← 不動
│   │   ├── BetaBanner.tsx                ← 不動
│   │   ├── TopNav.tsx                    ← 不動
│   │   ├── Footer.tsx                    ← 不動
│   │   ├── Hero.tsx                      ← 不動
│   │   ├── MainCTA.tsx                   ← 改 CTA 連到 Google Form
│   │   ├── ArtifactGrid.tsx              ← 不動
│   │   ├── Breadcrumb.tsx                ← 不動
│   │   ├── AdvancedDrawer.tsx            ← 不動
│   │   ├── FamilyTree.tsx                ← 改成靜態「改編列表」(Phase 1 復原)
│   │   ├── ContributorsWall.tsx          ← 改讀 build-time contributors.json
│   │   └── Discussion.tsx                ← 改成 "→ 到 GitHub Discussions" 按鈕
│   ├── lib/
│   │   ├── types.ts                      ← 完整保留
│   │   ├── packages.ts                   ← (新) 取代 github-api.ts,讀 data/packages.json
│   │   ├── search.ts                     ← (新) Fuse.js 包裝
│   │   └── geo.ts                        ← 保留
│   ├── data/                             ← (新) build-time 產生的 JSON
│   │   ├── packages.json                 ← 136 包 metadata
│   │   ├── packages-detail/              ← 每包一個 JSON (data_card + lesson_plan markdown)
│   │   │   ├── 1.1-II.json
│   │   │   ├── 1.1-III.json
│   │   │   └── ...
│   │   └── contributors.json             ← (Phase 1) GitHub commits 統計
│   ├── public/                           ← 靜態圖片 / favicon / OG image
│   ├── next.config.ts                    ← output: 'export', basePath, trailingSlash
│   ├── package.json                      ← 移除 firebase-admin, @octokit/rest;新增 fuse.js
│   ├── tsconfig.json                     ← 保留
│   ├── postcss.config.mjs                ← 保留
│   └── .env.local.example                ← 只剩 NEXT_PUBLIC_FORM_URL
│
├── scripts/                              ← Build-time 資料準備腳本
│   ├── build-packages-index.mjs          ← 從 cce-teaching-packages 拉 _index.json + data_card.json,寫入 web/data/
│   ├── build-contributors.mjs            ← (Phase 1) GitHub Contributors API
│   └── README.md
│
├── forms/                                ← Google Form 設定文件 (非程式碼)
│   ├── form_spec.md                      ← 4 步驟欄位規格 + Google Form 設定步驟
│   ├── sheet_columns.md                  ← Google Sheet 欄位對照
│   ├── apps_script_notify.gs             ← (可選) Apps Script: 新提交時寄通知
│   └── review_workflow.md                ← 審核員 SOP (10 分鐘形式審 checklist)
│
├── .github/
│   └── workflows/
│       ├── build-and-deploy.yml          ← 主流程: build packages → next build → 推 gh-pages
│       └── refresh-data.yml              ← 每日 cron: 重抓 packages.json (教案有更新時)
│
└── docs/
    ├── ARCHITECTURE.md                   ← 一頁架構圖 + 資料流
    ├── SECURITY.md                       ← 資安基線 (見本文 §7)
    ├── MAINTAINER_GUIDE.md               ← 接手者 30 分鐘上手
    └── PHASE_1_ROADMAP.md                ← 何時、依據哪些訊號才升級回動態後端
```

---

## 4. 關鍵改動細節

### 4.1 教案資料: build-time JSON 取代 runtime API

**現況**:
```typescript
// app_sample/lib/github-api.ts
export async function fetchAllPackages() {
  const res = await fetch(INDEX_URL, { next: { revalidate: 3600 } });
  // ...每次使用者開首頁都打 GitHub raw URL
}
```

**Lite**:
```typescript
// web/lib/packages.ts
import packages from '@/data/packages.json';
export function getAllPackages(): PackageSummary[] {
  return packages;
}
```

`packages.json` 由 [scripts/build-packages-index.mjs](scripts/build-packages-index.mjs) 在 GitHub Actions build 時產生。教案 repo 有更新 → 觸發 workflow → 重新 build → 自動 deploy。**使用者端零延遲、零 API 限額風險。**

### 4.2 教案詳情: `generateStaticParams` 預先產生 136 個 HTML

```typescript
// web/app/package/[keyId]/page.tsx
export async function generateStaticParams() {
  const packages = await import('@/data/packages.json');
  return packages.default.map((p) => ({ keyId: p.keyId }));
}
```

build 後產生 136 個靜態 HTML 檔,部署到 GitHub Pages。**SEO 完美 (每頁有 meta tags),載入快。**

### 4.3 改編表單: Google Form iframe

```tsx
// web/app/remix/[keyId]/page.tsx
export default async function RemixPage({ params }) {
  const { keyId } = await params;
  const formUrl = `${process.env.NEXT_PUBLIC_FORM_URL}?usp=pp_url&entry.${ENTRY_KEY_ID}=${keyId}`;
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr,400px] gap-6">
      <iframe
        src={formUrl}
        className="w-full min-h-[1800px] rounded-2xl border border-earth/10 shadow-warm"
        title={`改編 ${keyId}`}
      />
      <aside>
        <BadgeProgressCard keyId={keyId} />  {/* 保留視覺,純說明 */}
        <ContributionGuide />
      </aside>
    </main>
  );
}
```

**關鍵技巧**: Google Form 用 `usp=pp_url` 預填 keyId,老師不需手填教案編號。表單欄位規格詳見 [forms/form_spec.md](forms/form_spec.md)。

### 4.4 審核流程: Google Sheet + Apps Script

```
[老師] → 填 Google Form
   ↓
[Google Sheet] 自動新增一列 (含照片連結、省思、改編教案下載連結)
   ↓
[Apps Script trigger] → 寄 email 到審核員 + 在 Discord/LINE 群組通知
   ↓
[審核員] 在 Sheet 新增一欄填 "approved/rejected/notes"
   ↓
[每週一批次] 維護者跑 scripts/weekly-merge.mjs:
   - 讀已 approved 列
   - 在 cce-teaching-packages repo 建 branch + push 改編教案
   - 開 PR → 手動 merge
   - 寄結果通知信給老師
```

**時效說明**:
- 教案內容更新 (你自己 push) → **即時 2-5 分鐘自動上線** (GitHub Actions)
- 老師改編提交 → 即時收到 Google Form 確認信
- 改編內容出現在網站「改編列表」 → **約 7 天 (週結)**

**審核負擔**: 週 8-12 件 × 10 分鐘 = 約 1.5 小時/週,2 人輪流可接受。

### 4.5 改編家族樹 (FamilyTree)

**現況**: GraphQL 查 refs + 即時繪製 SVG (高複雜度)

**Lite (Phase 0)**: 在教案詳情頁顯示一個簡單的「本教案的改編列表」清單,每筆連到 GitHub PR:

```tsx
<section>
  <h3>改編紀錄 ({remixes.length})</h3>
  <ul>
    {remixes.map((r) => (
      <li key={r.prNumber}>
        <a href={r.prUrl}>{r.teacherName} · {r.school} · {r.date}</a>
      </li>
    ))}
  </ul>
</section>
```

資料來源: build-time 從 GitHub Pulls API 拉。**Phase 1 再升級成 SVG 樹狀圖。**

### 4.6 討論區 (Discussion)

**現況**: Firestore thread (要防 spam、檢舉、刪文)

**Lite**: GitHub Discussions
```tsx
<a href={`https://github.com/yujchang2017/cce-teaching-packages/discussions?discussions_q=${keyId}`}
   className="cta-button">
  💬 到 GitHub 討論區聊聊這份教案 →
</a>
```

GitHub 有現成的 spam filter、moderation、email notification。**零維護。**

---

## 5. 部署架構

```
[教師瀏覽器]
     ↓ HTTPS
[GitHub Pages: community.cce.tw]
     ↓ (CDN-cached HTML/JS/JSON)
靜態檔案 (約 500 KB JSON + 136 HTML)
     │
     │ (老師按 "我要改編這份教案")
     ↓
[Google Form] ← 填表單,上傳照片
     ↓
[Google Sheet] ← 自動同步
     ↓ (Apps Script trigger)
[Email/Discord 通知審核員]
     ↓ (人工審核)
[維護者每月手動]:
   git checkout cce-teaching-packages
   node scripts/monthly-merge.mjs   ← 讀 approved → 開 PR → merge
   ↓
[GitHub Pages 自動 rebuild & redeploy]   ← workflow_run trigger
```

**零 long-lived credential、零 vendor lock-in、零信用卡。**

---

## 6. 遷移時程 (3 週,1 人 0.5 FTE)

### Week 1: 骨架 + 資料管線
- [ ] 建立 `community_cce_tw_lite/` 資料夾結構
- [ ] 寫 [scripts/build-packages-index.mjs](scripts/build-packages-index.mjs) 並驗證能產出 packages.json
- [ ] 設定 [.github/workflows/build-and-deploy.yml](.github/workflows/build-and-deploy.yml)
- [ ] `next.config.ts` 改 `output: 'export'`,本地 build 測試

### Week 2: UI 移植 + Google Form
- [ ] 複製 13 個 components,改 import 路徑
- [ ] 首頁 / 教案詳情頁改讀 build-time JSON
- [ ] 設計並建立 Google Form (依 [forms/form_spec.md](forms/form_spec.md))
- [ ] Remix 頁改成 iframe + 預填 keyId
- [ ] 視覺對比驗證: 跟舊版 screenshot diff (Tailwind class 應 100% 一致)

### Week 3: 審核流程 + 部署
- [ ] 設定 Google Sheet + Apps Script 通知
- [ ] 寫 [scripts/monthly-merge.mjs](scripts/monthly-merge.mjs) (用 GITHUB_TOKEN env,僅維護者本機跑)
- [ ] 申請 community.cce.tw subdomain,CNAME 到 GitHub Pages
- [ ] 撰寫 [docs/MAINTAINER_GUIDE.md](docs/MAINTAINER_GUIDE.md)
- [ ] 邀請 2-3 位老師做 end-to-end 試跑
- [ ] 舊 `community_cce_tw/` 資料夾改名 `community_cce_tw_archived_v1/`

---

## 7. 資安基線 (避免「池魚之殃」再發生)

> 全面降低攻擊面,不再依賴信用卡綁定的雲服務

### 7.1 必做的 5 件事

| # | 項目 | 一次性成本 | 防什麼 |
|---|---|---|---|
| 1 | **Repo 開啟 GitHub Push Protection + Secret Scanning** | 2 分鐘 | commit 含 key 直接被擋 |
| 2 | **`gitleaks` 跑一次新舊 repo 歷史** | 10 分鐘 | 找出已外洩的舊 token |
| 3 | **Google 帳號獨立 alias (community-cce-tw@gmail.com),不用個人帳號** | 15 分鐘 | 個人帳號被盜不波及平台 |
| 4 | **如未來真要綁信用卡 → 用虛擬卡 (Revolut/圓夢卡),設 $1 USD 警示** | 30 分鐘 | 盜刷只丟虛擬卡 |
| 5 | **不再使用 long-lived PAT;改用 GitHub Actions 內建 `GITHUB_TOKEN`** | 0 分鐘 | token 自動 90 分鐘過期 |

### 7.2 Lite 版本天然不存在的風險

- ❌ Firebase service account key 外洩 → **不用 Firebase**
- ❌ Vercel env variable 被 preview deploy 看到 → **不用 Vercel**
- ❌ Octokit dependency 供應鏈攻擊 → **build script 用 native fetch,零 npm dep**
- ❌ Cloud Function cold-start race condition → **無 server**
- ❌ Firestore security rules 寫錯導致資料洩漏 → **無 Firestore**
- ❌ 信用卡盜刷波及平台 → **GitHub Pages + Forms 全免費**

### 7.3 仍需注意的 (但風險低)

| 風險 | 緩解 |
|---|---|
| 老師上傳的照片含學生臉部 | Google Form 加同意書欄位;Sheet 設權限只給審核員看 |
| Spam 提交灌爆 Google Form | 加 reCAPTCHA + Email 限制 |
| 維護者本機跑 `monthly-merge.mjs` 時 token 外洩 | Token 用 fine-grained 限定單一 repo,90 天到期 |
| GitHub repo 被惡意 PR | branch protection: require review,Phase 0 維護者直接 reject |

---

## 8. 兩三人維護日常 (預期工作量)

| 頻率 | 任務 | 工時 | 工具 |
|---|---|---|---|
| 每天 | 看 Discord 通知有無新提交 | 2 分鐘 | 手機 |
| 每週 | 審核 5-10 件 remix | 1 小時 | Google Sheet |
| 每月 | 跑 `monthly-merge.mjs` 合 PR + 寄通知 | 30 分鐘 | 本機 terminal |
| 每月 | 月結徽章 (寄信告知老師升級) | 30 分鐘 | Google Sheet + mail merge |
| 每季 | 教案內容更新 → push 到 cce-teaching-packages → 自動 redeploy | 0 維護 | GitHub Actions |
| 不定期 | 處理 GitHub Discussions 留言 | < 30 分鐘/週 | GitHub web |

**預計總工時: 每月 4-6 小時/人 × 2 人 = 充裕。**

---

## 9. Phase 1 升級觸發條件

**只有同時滿足以下「全部」條件,才考慮回頭加動態後端**:

- [ ] 月 remix 提交數 > 100 件 (連續 3 個月)
- [ ] Ambassador 註冊數 > 200 人
- [ ] 教師明確抱怨「Google Form 體驗差」(收集 ≥ 20 則回饋)
- [ ] 找到第 3 位以上的長期工程師夥伴

**Phase 1 加回的東西優先序**:
1. 個人化首頁 (要登入) → NextAuth.js + Firebase Auth (僅 Auth,不要 Firestore)
2. FamilyTree SVG → 把 build-time JSON 升級成 GraphQL fetch
3. Admin 後台 → 取代 Google Sheet
4. Discussion → 從 GitHub Discussions 遷出 (除非真的需要)

**重點**: Lite 版的所有資料 (Google Sheet / Form responses) 都可以無痛 export 成 CSV/JSON 餵給未來的 Firestore,**沒有 vendor lock-in**。

---

## 10. 風險與限制 (誠實揭露)

| 風險 | 影響 | 緩解 |
|---|---|---|
| Google Form 視覺與本站 Tailwind 不完全一致 | 中 | iframe 包起來,外框用 Tailwind 美化;表單 header 隱藏 |
| 教案搜尋無 server-side relevance ranking | 低 | Fuse.js 對 136 筆夠用;若破 1000 筆再考慮 |
| 改編家族樹延後 → 失去「炫」的賣點 | 中 | Phase 0 改用「改編老師頭像牆」維持視覺豐富度 |
| 月結手動合 PR 容易忘 | 中 | GitHub Issue template + 月初自動建 reminder issue |
| Google Workspace 政策變動 (Forms 限額) | 低 | Tally.so 為備案,schema 可互轉 |
| 老師上傳大檔案 (>10 MB 影片) | 中 | Form 限制檔案類型為照片 + PDF;影片要求外嵌 YouTube |

---

## 11. 立刻可以開始的第一步

```bash
# 1. 建立資料夾骨架 (今天)
cd C:\Users\yjchang\sdgame
mkdir community_cce_tw_lite\web
mkdir community_cce_tw_lite\scripts
mkdir community_cce_tw_lite\forms
mkdir community_cce_tw_lite\docs

# 2. 複製 PLAN.md 到資料夾 (本檔案)
# 3. 跟 user 確認 PLAN.md → 同意後執行 Week 1 任務
```

---

## 12. 決策紀錄 (2026-04-23 user 拍板)

| # | 問題 | 決策 |
|---|---|---|
| 1 | Google Form 帳號 | **新建共用 alias** (建議 community-cce-tw@gmail.com) |
| 2 | community.cce.tw DNS 控制權 | **user 本人持有** (CNAME 由 user 設定) |
| 3 | 舊 `community_cce_tw/` 資料夾處理 | **保留不動** (與 lite 版並存) |
| 4 | `cce-teaching-packages` repo 可見性 | **改回 public** (前提:先 `gitleaks` 掃歷史確認無殘留 secret) |
| 5 | 改編顯示頻率 | **週結** (場景 B-b,7 天延遲;教案內容更新仍是即時 2-5 分鐘) |

### 對應排程影響

- Week 1 第一個動作:`gitleaks detect --source <repo>` 掃 `cce-teaching-packages` 與 `community-cce-tw` 兩個 repo 的 commit history,確認無外洩 token,**然後才**改 public。
- 月結改成「週結」:把 §4.4 的 `monthly-merge.mjs` 改名為 `weekly-merge.mjs`,GitHub Issue reminder 改每週一自動建。
- §8 維護工時更新:每週 30 分鐘合 PR (取代月 30 分鐘),總工時仍在 4-6 小時/月/人 範圍內。

---

*下一步*: 進入 Week 1 — 建立資料夾骨架、複製 components、撰寫 build script 與 GitHub Actions workflow。
