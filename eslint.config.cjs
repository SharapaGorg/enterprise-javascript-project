const js = require("@eslint/js");
const vue = require("eslint-plugin-vue");
const prettier = require("eslint-config-prettier");
const tseslint = require("typescript-eslint");
const vueParser = require("vue-eslint-parser");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".nuxt/**",
      ".output/**",
      "dist/**",
      ".yarn/**",
      "eslint.config.*",
      "nuxt.config.*",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...vue.configs["flat/recommended"],

  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      // Vue правила
      "vue/no-v-html": "off",
      "vue/multi-word-component-names": "off",
      "vue/attributes-order": "warn",

      // TypeScript правила
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // JavaScript правила
      "no-undef": "off", // Отключаем для TypeScript файлов
      "no-unused-vars": "off", // Используем версию TypeScript
    },
  },

  // Специфичная конфигурация для TypeScript файлов
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
    },
  },

  prettier,
];
