# Phase 1 升級路線圖

> ⚠️ **不要過早升級**。此文件僅在「全部觸發條件」達成時才該被讀。

## 升級觸發條件 (全部必須達成)

- [ ] 月 remix 提交數 > 100 件 (連續 3 個月)
- [ ] 註冊 ambassador > 200 人
- [ ] 收集 ≥ 20 則「Google Form 體驗差」的具體回饋
- [ ] 找到第 3 位以上的長期工程師夥伴 (能 commit ≥ 5 hr/週)

## 升級優先序

### 階段 1A: 加入登入 (最簡單)

加 NextAuth.js + Google OAuth,但**只用 Auth,不加 Firestore**:
- 老師可在前端「儲存最愛教案」(用 localStorage,登入只是身份識別)
- 個人頁顯示「我提交過的改編」(從 Sheet API 讀)
- 預估工時: 1 週

### 階段 1B: FamilyTree SVG

把現在的「改編列表」改成 d3/dagre 樹狀圖:
- build-time 從 GitHub Pulls API 抓所有 PR + parent PR 關係
- 用 React Flow 或 d3-hierarchy 繪製
- 預估工時: 1 週

### 階段 1C: 取代 Google Form (動態 Remix 表單)

只有當「Form 體驗差」回饋 ≥ 20 則才做:
- 把 Form 改回 Next.js form + Server Action
- 上傳改用 Cloudflare R2 (免費 10 GB) 或 Backblaze B2
- 注意: 此時要回頭面對「憑證管理」問題,務必看 [SECURITY.md](SECURITY.md)
- 預估工時: 2-3 週

### 階段 1D: Admin 後台

取代 Google Sheet:
- 加 Firestore (僅 submissions 一個 collection)
- 用 Firebase Admin SDK 寫入,用 Firestore Security Rules 限定 admin 可讀寫
- 預估工時: 2 週

### 階段 1E: 動態 Discussion (最後考慮)

只有當 GitHub Discussions 真的不夠用才做。
通常 Phase 1 不需要。

## 不要做的事

- ❌ 不要為了「炫技」升級。每個升級都增加維護成本與資安攻擊面。
- ❌ 不要同時升級多個階段。一次一個,觀察 1 個月再決定下一步。
- ❌ 不要在沒有第 3 位工程師夥伴前升級。

## 資料遷移

Lite → Phase 1 的資料無痛遷移:

```bash
# 從 Google Sheet 匯出 CSV
# 跑遷移腳本 → Firestore
node scripts/migrate-sheet-to-firestore.mjs

# Form 收到的舊照片 (Google Drive) 仍可繼續用,新提交才寫到 R2
```
