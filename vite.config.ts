import { resolve } from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
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
