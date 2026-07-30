import { resolve } from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.tsx"],
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/meteor-shower/index.ts"),
      formats: ["es"],
      fileName: () => "meteor-shower/index.js",
      cssFileName: "meteor-shower",
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
    },
  },
});
