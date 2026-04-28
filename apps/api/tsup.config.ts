import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/workers/job-worker.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  noExternal: ["@presight/shared"],
});
