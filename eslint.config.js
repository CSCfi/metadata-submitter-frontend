import path from "node:path"
import { fileURLToPath } from "node:url"

import { fixupPluginRules, fixupConfigRules } from "@eslint/compat"
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import _import from "eslint-plugin-import"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  { files: ["**/*.tsx", "**/*.ts"] },
  {
    ignores: [
      "**/build/*",
      ".github/*",
      "**/*.d.ts",
      "**/playwright/playwright-report/*",
      "**/coverage/**",
    ],
  },
  ...fixupConfigRules(compat.extends("")),
  {
    plugins: {
      react: fixupPluginRules(react),
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "react-hooks": fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: true,
        Cypress: true,
      },

      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/resolver": {
        node: {
          paths: ["src"],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },

          "newlines-between": "always",
          groups: ["builtin", "external", "parent", "sibling", "index"],

          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
          ],

          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],

      "no-unused-vars": "off",
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]
