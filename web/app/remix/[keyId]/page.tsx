// 改編頁 — 用 Google Form iframe 取代原本的 RemixForm.tsx
// 完全靜態,無需 server actions / firebase / octokit
//
// 環境變數 (build 時注入,public):
//   NEXT_PUBLIC_FORM_URL          — Google Form viewform URL
//   NEXT_PUBLIC_FORM_ENTRY_KEY_ID — Form 中「教案編號」欄位的 entry.xxx ID

import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAllPackages, getAllKeyIds } from "@/lib/github-api";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllKeyIds().map((keyId) => ({ keyId }));
}

export default async function RemixPage({
  params,
}: {
  params: Promise<{ keyId: string }>;
}) {
  const { keyId } = await params;
  const all = await fetchAllPackages();
  const pkg = all.find((p) => p.keyId === keyId);
  if (!pkg) notFound();

  const formBase = process.env.NEXT_PUBLIC_FORM_URL ?? "";
  const entryKey = process.env.NEXT_PUBLIC_FORM_ENTRY_KEY_ID ?? "";
  const prefilledUrl =
    formBase && entryKey
      ? `${formBase}${formBase.includes("?") ? "&" : "?"}usp=pp_url&entry.${entryKey}=${encodeURIComponent(keyId)}&embedded=true`
      : "";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
      {/* Breadcrumb */}
      <nav className="text-sm text-mute mb-4 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-sun transition">首頁</Link>
        <span className="text-earth/40">›</span>
        <Link href={`/package/${keyId}/`} className="hover:text-sun transition">{keyId}</Link>
        <span className="text-earth/40">›</span>
        <span className="text-ink font-medium">改編這份教案</span>
      </nav>

      {/* Hero */}
      <section className="bg-white rounded-2xl shadow-warm border border-earth/10 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-sand/80 text-earth font-mono font-bold px-2.5 py-1 rounded">{pkg.keyId}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-forest/10 text-forest font-medium">{pkg.levelLabel}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-sun/10 text-sunDeep">主題 {pkg.themeNumber} · {pkg.themeName}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">分享《{pkg.topic}》</h1>
        <p className="text-sm text-ink/75">無論你是<b>改編了教案</b>、<b>試教了原版</b>、或<b>兩者都做</b>,都歡迎填寫下方表單分享成果。表單會依你選擇的「提交類型」自動跳過不需要的題目。每週一統一審核。</p>
      </section>

      <div className="grid lg:grid-cols-[1fr,340px] gap-6">
        {/* Google Form iframe (桌機左 / 手機放下方) */}
        <section className="bg-white rounded-2xl shadow-warm border border-earth/10 p-2 sm:p-3 overflow-hidden order-2 lg:order-1">
          {prefilledUrl ? (
            <iframe
              src={prefilledUrl}
              className="w-full rounded-xl"
              style={{ height: "1800px", border: 0 }}
              title={`改編 ${keyId} 表單`}
              loading="lazy"
            >
              載入中…
            </iframe>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h2 className="font-bold text-ink mb-2">表單尚未設定</h2>
              <p className="text-sm text-mute mb-4">
                維護者請在 <code className="bg-sand/50 px-1.5 py-0.5 rounded">.env.local</code> 設定
                <br /><code className="text-xs">NEXT_PUBLIC_FORM_URL</code> 與 <code className="text-xs">NEXT_PUBLIC_FORM_ENTRY_KEY_ID</code>
              </p>
              <p className="text-xs text-mute">設定方式見 <code>forms/form_spec.md</code></p>
            </div>
          )}
        </section>

        {/* 側邊欄 — 徽章說明 + 流程 (手機置頂 / 桌機右側) */}
        <aside className="space-y-4 order-1 lg:order-2">
          {/* 徽章說明 */}
          <div className="bg-white rounded-2xl shadow-warm border border-earth/10 p-5">
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2">📌 三種提交類型</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-xl">🌟</span>
                <div>
                  <b className="text-sunDeep">A 改編+試教</b>
                  <p className="text-xs text-mute">完整循環,徽章加倍</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🌳</span>
                <div>
                  <b className="text-forest">B 只改編</b>
                  <p className="text-xs text-mute">文件層面修改 (還沒進教室)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🏫</span>
                <div>
                  <b className="text-forest">C 只試教</b>
                  <p className="text-xs text-mute">課堂實作 (沒改原版內容)</p>
                </div>
              </li>
            </ul>
          </div>

          {/* 徽章說明 */}
          <div className="bg-white rounded-2xl shadow-warm border border-earth/10 p-5">
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2">🏆 累積徽章</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-xl">🌱</span>
                <div>
                  <b className="text-forest">新芽</b>
                  <p className="text-xs text-mute">提交 ≥ 1 件 (任何類型)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🌳</span>
                <div>
                  <b className="text-forest">青樹</b>
                  <p className="text-xs text-mute">改編 ≥ 1 件 + 試教 ≥ 1 件</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🏔️</span>
                <div>
                  <b className="text-sunDeep">氣候教育師</b>
                  <p className="text-xs text-mute">6 大主題各有 A 類 (改編+試教) ≥ 1 件 + 年會頒獎</p>
                </div>
              </li>
            </ul>
          </div>

          {/* 流程說明 */}
          <div className="bg-white rounded-2xl shadow-warm border border-earth/10 p-5">
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2">📅 接下來會發生什麼</h3>
            <ol className="space-y-2 text-xs text-ink/80 list-decimal list-inside">
              <li>送出後立刻收到確認信</li>
              <li>每週一審核員批次審查</li>
              <li>通過 → 合併到主庫,寄信通知</li>
              <li>滿足條件即發放徽章</li>
            </ol>
          </div>

          {/* 提示 */}
          <div className="bg-sun/10 border border-sun/30 rounded-2xl p-5 text-xs text-ink/85">
            <p className="font-bold mb-2">💡 提交前準備 (依類型)</p>
            <ul className="list-disc list-inside space-y-1">
              <li><b>有試教 (A/C)</b>: 至少 2 張試教照片 (建議壓縮至 2 MB 內)</li>
              <li><b>有試教 (A/C)</b>: 教學省思 500 字以上</li>
              <li><b>有改編 (A/B)</b>: 改編後的教案檔 (md / docx / pdf)</li>
              <li>確認照片內人物已取得肖像權同意</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* 返回 */}
      <div className="mt-8 pt-6 border-t border-earth/10">
        <Link href={`/package/${keyId}/`} className="text-sm text-earth hover:text-sunDeep">
          ← 返回教案頁
        </Link>
      </div>
    </main>
  );
}
