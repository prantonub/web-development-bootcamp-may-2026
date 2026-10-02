import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    // "@/..." -> "src/..." (required by shadcn/ui)
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://financehub-personal-expence-tracker.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
