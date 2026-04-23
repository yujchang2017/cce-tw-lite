# 資安基線 — community.cce.tw Lite

> 目標: 把攻擊面降到「即使被攻擊也不會波及計畫經費 / 教師資料 / GitHub 帳號」

## 設計原則

1. **沒有 long-lived secret** — 所有寫入操作改人工或 GitHub Actions 內建 token
2. **沒有綁定信用卡的雲服務** — GitHub Pages + Google Forms 全免費
3. **單一可信邊界** — Google Workspace + GitHub,不再增加第三方
4. **資料可攜** — Google Sheet / Form 隨時可 export CSV/JSON

## 必做的 5 件事 (新接手者第一週)

| # | 項目 | 工時 | 防什麼 |
|---|---|---|---|
| 1 | Repo 開啟 GitHub Push Protection + Secret Scanning | 2 min | commit 含 key 直接被擋 |
| 2 | 跑 `gitleaks detect` 掃 cce-teaching-packages 與 community-cce-tw 歷史 | 10 min | 找出已外洩的 token |
| 3 | 確認 community-cce-tw@gmail.com 開啟 2FA + 備援 phone | 5 min | 共用帳號被盜 |
| 4 | (若未來真要綁卡) 用虛擬卡,設 $1 USD 警示 | 30 min | 信用卡盜刷波及 |
| 5 | 審核員的 fine-grained PAT 限定單一 repo,90 天到期 | 5 min | token 外洩影響範圍 |

## Lite 版本天然不存在的風險

- ❌ Firebase service account key 外洩 → **不用 Firebase**
- ❌ Vercel env var 被 preview deploy 看到 → **不用 Vercel**
- ❌ Octokit dependency 供應鏈攻擊 → **build script 用 native fetch**
- ❌ Cloud Function cold-start race → **無 server**
- ❌ Firestore security rules 寫錯洩漏資料 → **無 Firestore**
- ❌ 信用卡盜刷波及 → **GitHub + Google Forms 全免費**

## 仍需注意的

| 風險 | 緩解 |
|---|---|
| 老師上傳照片含學生臉部 | Form 同意書 + Sheet 限編輯者 |
| Spam 灌爆 Form | reCAPTCHA + email 驗證 |
| 維護者本機跑 weekly-merge.mjs token 外洩 | Token 限定單 repo + 90 天到期 |
| GitHub repo 惡意 PR | branch protection: require review |
| community-cce-tw@gmail.com 帳號被盜 | 2FA + 多備援 + 不裝任何 chrome extension |

## 事件回應 SOP (萬一發生 incident)

### 發現可疑提交 / 帳號異常 / Token 疑似外洩

1. **立即** revoke 所有 PAT (https://github.com/settings/tokens)
2. **立即** 撤銷 community-cce-tw@gmail.com session (Google Account → Security → 全部登出)
3. 改 community-cce-tw@gmail.com 密碼 + 重設 2FA
4. 看 GitHub audit log: Settings → Security log
5. 看 Google Account 的「最近活動」
6. 發布事件公告於 GitHub Discussions
7. 通知所有審核員 / ambassador
8. 24h 內寫 incident report (放 docs/incidents/)

## 與舊系統的差異

舊版 ([RESTART_GUIDE.md](../../community_cce_tw/docs/RESTART_GUIDE.md)) 的「池魚之殃」事件:
- 信用卡盜刷 → 連帶撤銷 GitHub PAT + Firebase key → 平台癱瘓 1 週

Lite 版即使再次發生同等級事件:
- 信用卡: **未綁定**,完全不受影響
- GitHub PAT: **不存在於 server**,只在維護者本機,影響範圍 = 該維護者 90 天內已開的 PR
- Firebase: **不存在**

預估恢復時間: < 30 分鐘 (revoke 該維護者 token + 換新即可)
