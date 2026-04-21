import type { NextConfig } from "next";
import path from "path";

const turbopackRoot =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

const nextConfig: NextConfig = {
  /** Hindari Turbopack memilih parent folder saat ada beberapa package-lock (lebih cepat & stabil di dev). */
  turbopack: {
    root: path.join(turbopackRoot),
  },
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
