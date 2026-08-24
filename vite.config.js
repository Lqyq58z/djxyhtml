import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        dongjiaxinying: resolve(process.cwd(), "dongjiaxinying.html"),
      },
    },
  },
});
