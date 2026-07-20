import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Runs `wrangler dev` alongside the Vite dev server so /match and /room/*
// (served by the Worker, see worker/) are reachable during `vp dev` without
// having to start a second process by hand.
function wranglerDev(): Plugin {
  let child: ChildProcess | undefined;
  return {
    name: "wrangler-dev",
    apply: "serve",
    configureServer(server) {
      const wranglerBin = path.join(__dirname, "node_modules", ".bin", "wrangler");
      child = spawn(wranglerBin, ["dev"], { stdio: "inherit" });
      const stop = () => child?.kill();
      server.httpServer?.once("close", stop);
      process.once("exit", stop);
    },
  };
}

export default Object.assign(
  defineConfig({
    plugins: [tailwindcss(), reactRouter(), wranglerDev()],
    resolve: {
      tsconfigPaths: true,
    },
  }),
  {
    staged: {
      "*": "vp check --fix",
    },
    fmt: {},
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "off" },
      options: { typeAware: true, typeCheck: true },
      ignorePatterns: [".claude/worktrees/**"],
    },
  },
);
