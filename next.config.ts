import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev: izinkan hostname yang dipakai browser (localhost ≠ 127.0.0.1 untuk Origin).
  // Tanpa ini, navigasi client bisa gagal dengan TypeError: Failed to fetch pada RSC.
  allowedDevOrigins: ["127.0.0.1", "::1"],
  // Memecah impor menjadi per-modul agar bundle klien lebih kecil (ikon & kit DnD).
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@base-ui/react",
    ],
  },
};

export default nextConfig;
