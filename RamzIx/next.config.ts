import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./lib/image-hosts";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    formats: ["image/webp"],
    qualities: [70],
    // Сайт паҳноиаш то 480px аст, андозаҳои калон лозим нестанд
    deviceSizes: [480, 640, 828, 1080],
    imageSizes: [64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 2678400, // 31 рӯз
  },
};

export default nextConfig;
