import type { NextConfig } from "next";

// GitHub Pages project site 部署在 /<repo>/ 子路徑,需要 basePath
// 綁定 custom domain 後,workflow 會把 NEXT_PUBLIC_BASE_PATH 設成空字串,自動關閉 basePath
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/cce-tw-lite";
const basePath = rawBasePath && rawBasePath !== "/" ? rawBasePath : undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
