import type { NextConfig } from "next";

// GitHub Pages project site 部署在 /<repo>/ 子路徑,需要 basePath
// 綁定 custom domain (community.cce.tw) 後,把 BASE_PATH 設空字串(或在 workflow 取消設定)即可
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/cce-tw-lite";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
