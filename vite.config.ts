import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), basicSsl(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
});
