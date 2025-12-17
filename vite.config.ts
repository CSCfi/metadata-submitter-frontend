import fs from "fs"
import path from "path"

import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import viteTsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const proxyUrl = env.VITE_APP_BACKEND_PROXY || "localhost:5430"
  const proxyTo = {
    target: `http://${proxyUrl}`,
    changeOrigin: true,
  }
  const proxy = {
    "/aai": proxyTo,
    "/v1/objects": proxyTo,
    "/v1/validate": proxyTo,
    "/v1/submit": proxyTo,
    "/v1/submissions": proxyTo,
    "/v1/publish": proxyTo,
    "/callback": proxyTo,
    "/logout": proxyTo,
    "/v1/users": proxyTo,
    "/v1/files": proxyTo,
    "/v1/rems": proxyTo,
    "/v1/api/keys": proxyTo,
  }

  /*
   * Bare file path is allowed in development but in production build in Docker container,
   * the bare paths are not resolved automatically, we need to resolve them first.
   * Otherwise, we would need to import component as "../../folder/component" instead of "folder/component"
   */
  // Configure the path aliases
  const srcDir = path.resolve(__dirname, "src")
  // Folder alias
  const folders = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(f => f.name)
  // File alias
  const files = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter(f => f.isFile())
    .map(f => f.name.replace(/\.(ts|tsx)$/, ""))

  const pathAliases = [...folders, ...files].map(name => ({
    find: name,
    replacement: path.resolve(srcDir, name),
  }))

  return {
    base: "",
    build: {
      outDir: "build",
    },
    plugins: [
      /*
       '@apidevtools/json-schema-ref-parser' library uses  Node's core modules and Vite does not support it. We need to use 'nodePolyfills' to polyfill Node's Core Modules for browser environments
      */
      nodePolyfills({
        include: ["path"],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      viteTsconfigPaths(),
    ],
    resolve: {
      alias: pathAliases,
    },
    server: {
      // this ensures that the browser opens upon server start
      open: mode !== "test",
      // this sets a default port to 3000
      port: 3000,
      proxy,
      host: mode === "test",
    },
    define: {
      "process.env": {},
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "vitest-setup.ts",
      server: {
        deps: {
          inline: ["@mui/x-data-grid"],
        },
      },
      coverage: {
        reporter: ["text", "html", "lcov"],
        exclude: ["node_modules/", "vitest-setup.ts"],
      },
      exclude: ["**/node_modules/**", "**/playwright/**", "vitest-setup.ts"],
    },
  }
})
