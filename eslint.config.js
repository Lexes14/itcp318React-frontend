import js from "@eslint/js";
import reactRefresh from "eslint-plugin-react-refresh";
export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        document: "readonly",
        FormData: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        window: "readonly",
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "no-unused-vars": "off",
      "react-refresh/only-export-components": "off",
    },
  },
];
