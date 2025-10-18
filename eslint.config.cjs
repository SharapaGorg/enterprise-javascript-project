const js = require("@eslint/js");
const vue = require("eslint-plugin-vue");
const prettier = require("eslint-config-prettier");

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

  ...vue.configs["flat/recommended"],

  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "vue/no-v-html": "off",
    },
  },

  prettier,
];
