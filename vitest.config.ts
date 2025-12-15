import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ["browser"],
    mainFields: ["browser", "module", "main"],
    alias: [
      {
        find: /^svelte$/,
        replacement: path.resolve("./node_modules/svelte/src/index-client.js"),
      },
      {
        find: /^svelte\/internal\/client$/,
        replacement: path.resolve(
          "./node_modules/svelte/src/internal/client/index.js"
        ),
      },
      {
        find: /^svelte\/internal\/server$/,
        replacement: path.resolve(
          "./node_modules/svelte/src/internal/server/index.js"
        ),
      },
      {
        find: /^svelte\/server$/,
        replacement: path.resolve("./node_modules/svelte/src/server/index.js"),
      },
      { find: "$lib", replacement: path.resolve("./src/lib") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,svelte}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "src/test/setup.ts",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
      ],
    },
    server: {
      deps: {
        inline: ["svelte", "@testing-library/svelte"],
      },
    },
  },
});
