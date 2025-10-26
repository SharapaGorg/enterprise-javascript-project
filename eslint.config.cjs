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
      globals: {
        // Nuxt auto-imports
        defineNuxtRouteMiddleware: "readonly",
        navigateTo: "readonly",
        useSupabaseUser: "readonly",
        useSupabaseClient: "readonly",
        useAuth: "readonly",
        useHead: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        useFetch: "readonly",
        useAsyncData: "readonly",
        useState: "readonly",
        useRuntimeConfig: "readonly",
        definePageMeta: "readonly",
        defineEventHandler: "readonly",
        readBody: "readonly",
        createError: "readonly",
        serverSupabaseClient: "readonly",
        serverSupabaseUser: "readonly",
        // Vue auto-imports
        ref: "readonly",
        reactive: "readonly",
        computed: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        onMounted: "readonly",
        onUnmounted: "readonly",
        onBeforeMount: "readonly",
        onBeforeUnmount: "readonly",
        onUpdated: "readonly",
        onBeforeUpdate: "readonly",
        nextTick: "readonly",
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        test: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      // Vue правила
      "vue/no-v-html": "off",
      "vue/multi-word-component-names": "off",
      "vue/attributes-order": "warn",
      
      // TypeScript правила
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      
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
