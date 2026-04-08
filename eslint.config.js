import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Ignore these folders entirely
    ignores: [
      "dist",
      "node_modules",
      "backend",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Warnings only — don't fail the build
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react-hooks/exhaustive-deps": "warn",

      // Turn off rules that affect shadcn/ui generated files
      // These files are auto-generated — we don't own or maintain them
      "@typescript-eslint/no-empty-object-type": "off",

      // Allow require() — needed in tailwind.config.ts
      "@typescript-eslint/no-require-imports": "off",

      // Already off
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
