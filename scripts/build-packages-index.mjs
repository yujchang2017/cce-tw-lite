#!/usr/bin/env node
/**
 * Build-time data fetcher for community.cce.tw Lite
 *
 * 從 yujchang2017/cce-teaching-packages (public repo) 抓:
 *   1. packages/_index.json  → web/data/packages.json
 *   2. 每個 keyId 的 data_card.json + lesson_plan.md + ppt_script.md + resources.md + qa_report.md
 *      → web/data/packages-detail/{keyId}.json
 *
 * 在 GitHub Actions / 本地開發 (npm run dev) build 前執行。
 * 不需要 GitHub token (repo 為 public)。
 *
 * 失敗策略:
 *   - 若 _index.json 抓不到 → 寫入空 packages.json + 終止 exit 1
 *   - 個別 detail 抓不到 → 寫入 nulls,繼續處理其他包
 *
 * Usage:
 *   node scripts/build-packages-index.mjs
 *   node scripts/build-packages-index.mjs --offline   # 跳過下載,只在 web/data 已存在時可用
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WEB_DATA = join(ROOT, "web", "data");
const DETAIL_DIR = join(WEB_DATA, "packages-detail");

const REPO = process.env.PACKAGES_REPO ?? "yujchang2017/cce-teaching-packages";
const BRANCH = process.env.PACKAGES_BRANCH ?? "main";
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const PAGES_BASE = `https://${REPO.split("/")[0]}.github.io/${REPO.split("/")[1]}`;
const INDEX_URL = `${RAW_BASE}/packages/_index.json`;

const isOffline = process.argv.includes("--offline");

/** 簡易 fetch with retry + timeout */
async function fetchWithRetry(url, { retries = 2, timeoutMs = 15000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      if (res.status === 404) return res; // 404 不重試
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

async function fetchText(path) {
  try {
    const res = await fetchWithRetry(`${RAW_BASE}/${path}`);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function fetchJson(path) {
  try {
    const res = await fetchWithRetry(`${RAW_BASE}/${path}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

const LEVEL_LABEL = { II: "幼兒園低年級", III: "國小中高", IV: "國中", V: "高中" };
const THEME_EMOJI = { 1: "🌍", 2: "🌱", 3: "⚖️", 4: "🧠", 5: "♻️", 6: "🚀" };

function toSummary(entry) {
  return {
    keyId: entry.keyId,
    level: entry.level,
    levelLabel: LEVEL_LABEL[entry.level] ?? entry.level,
    topic: entry.topic,
    themeNumber: entry.themeNumber,
    themeName: entry.themeName,
    summary: entry.mascot
      ? `吉祥物：${entry.mascot} · 年段 ${entry.ageBand}`
      : `年段 ${entry.ageBand} · 主題 ${entry.themeNumber} ${entry.themeName}`,
    stars: 0,
    forks: 0,
    contributors: 0,
    emojis: THEME_EMOJI[entry.themeNumber] ?? "📘",
    isOfficial: true,
    hasDetail: true,
    mascot: entry.mascot,
    ageBand: entry.ageBand,
    publishedAt: entry.publishedAt,
    files: entry.files,
  };
}

async function buildOneDetail(entry) {
  const keyId = entry.keyId;
  const parts = keyId.split("-");
  const levelLc = (parts[parts.length - 1] ?? "").toLowerCase();
  const dir = `packages/level-${levelLc}/${keyId}`;
  const base = `${RAW_BASE}/${dir}`;
  const pagesBase = `${PAGES_BASE}/${dir}`;

  const [dataCard, lessonPlanMd, pptScriptMd, resourcesMd, qaReportMd] = await Promise.all([
    fetchJson(`${dir}/data_card.json`),
    fetchText(`${dir}/lesson_plan.md`),
    fetchText(`${dir}/ppt_script.md`),
    fetchText(`${dir}/resources.md`),
    fetchText(`${dir}/qa_report.md`),
  ]);

  return {
    summary: toSummary(entry),
    dataCard,
    lessonPlanMd,
    pptScriptMd,
    resourcesMd,
    qaReportMd,
    worksheetRawUrl: `${base}/worksheet.html`,
    worksheetPagesUrl: `${pagesBase}/worksheet.html`,
    baseUrl: base,
    remixes: [], // Phase 1 由另一支 script 填入
  };
}

async function main() {
  await mkdir(WEB_DATA, { recursive: true });
  await mkdir(DETAIL_DIR, { recursive: true });

  if (isOffline) {
    const indexPath = join(WEB_DATA, "packages.json");
    if (!(await fileExists(indexPath))) {
      console.error("[build] --offline 模式但 packages.json 不存在,中止");
      process.exit(1);
    }
    console.log("[build] --offline 模式,跳過下載");
    return;
  }

  console.log(`[build] 抓取 index: ${INDEX_URL}`);
  let indexJson;
  try {
    const res = await fetchWithRetry(INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    indexJson = await res.json();
  } catch (err) {
    console.error(`[build] 抓 _index.json 失敗:`, err.message);
    // 寫入最小 fallback,避免 next build 直接掛掉
    await writeFile(
      join(WEB_DATA, "packages.json"),
      JSON.stringify({ generated_at: new Date().toISOString(), total_packages: 0, packages: [], _error: String(err) }, null, 2)
    );
    process.exit(1);
  }

  const packages = Array.isArray(indexJson.packages) ? indexJson.packages : [];
  console.log(`[build] 取得 ${packages.length} 個教案,開始拉 detail...`);

  // 寫入主 index
  await writeFile(
    join(WEB_DATA, "packages.json"),
    JSON.stringify(indexJson, null, 2)
  );

  // 並行 detail (限制並發避免被 rate limit)
  const CONCURRENCY = 6;
  let done = 0;
  let failed = 0;
  const queue = [...packages];

  async function worker() {
    while (queue.length) {
      const entry = queue.shift();
      if (!entry) break;
      try {
        const detail = await buildOneDetail(entry);
        await writeFile(
          join(DETAIL_DIR, `${entry.keyId}.json`),
          JSON.stringify(detail, null, 2)
        );
        done++;
        if (done % 20 === 0) console.log(`[build] ...完成 ${done}/${packages.length}`);
      } catch (err) {
        failed++;
        console.error(`[build] ✗ ${entry.keyId}: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`[build] 完成: ${done} 成功, ${failed} 失敗 / 共 ${packages.length}`);

  if (failed > packages.length / 4) {
    console.error("[build] 失敗超過 25%,視為 build 失敗");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[build] 未預期錯誤:", err);
  process.exit(1);
});
