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
    "/v1/schemas": proxyTo,
    "/v1/validate": proxyTo,
    "/v1/submit": proxyTo,
    "/v1/submissions": proxyTo,
    "/v1/publish": proxyTo,
    "/v1/drafts": proxyTo,
    "/callback": proxyTo,
    "/logout": proxyTo,
    "/v1/users": proxyTo,
    "/v1/templates": proxyTo,
    "/v1/workflows": proxyTo,
    "/v1/files": proxyTo,
  }

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
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: 3000,
      proxy,
    },
    define: {
      "process.env": {},
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "vitest-setup.ts",
      coverage: {
        reporter: ["text", "html", "lcov"],
        exclude: ["node_modules/", "vitest-setup.ts"],
      },
      exclude: ["**/node_modules/**", "**/playwright/**", "vitest-setup.ts"],
    },
  }
})
