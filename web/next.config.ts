import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 靜態匯出 (GitHub Pages 用)
  output: "export",
  // GitHub Pages 用 trailing slash 比較不會 404
  trailingSlash: true,
  // 自訂域名 community.cce.tw 不需要 basePath;若先用 yujchang2017.github.io/community-cce-tw 需開啟下行
  // basePath: "/community-cce-tw",
  images: {
    // 靜態匯出不能用 next/image optimizer
    unoptimized: true,
  },
};

export default nextConfig;
