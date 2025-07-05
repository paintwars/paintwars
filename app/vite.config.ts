/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["esnext"],
  },
  esbuild: {
    target: "esnext",
  },
  plugins: [
    react(),
    legacy({
      renderLegacyChunks: false,
    }),
  ],
  resolve: {
    alias: {
      // Explicitly define path aliases here as well for redundancy
      "$store": path.resolve(__dirname, "./src/store"),
      "$api": path.resolve(__dirname, "./src/api"),
      "$components": path.resolve(__dirname, "./src/components"),
      "$features": path.resolve(__dirname, "./src/features"),
      "$abis": path.resolve(__dirname, "./src/abis"),
      "$hooks": path.resolve(__dirname, "./src/hooks"),
      "$utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});