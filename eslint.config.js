import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import { existsSync, readFileSync } from 'node:fs';
import tseslint from 'typescript-eslint';

// 自动导入的声明由构建插件维护，ESLint 需要单独注册对应的只读全局变量。
const autoImportDeclarations = new URL('./auto-imports.d.ts', import.meta.url);
const autoImportGlobals = existsSync(autoImportDeclarations)
  ? Object.fromEntries(
      [...readFileSync(autoImportDeclarations, 'utf8').matchAll(/^\s*const\s+([A-Za-z_$][\w$]*)\s*:/gm)].map(
        (match) => [match[1], 'readonly'],
      ),
    )
  : {};

export default defineConfig(
  globalIgnores(['node_modules/**', 'dist/**', '**/.rsbuild/**', 'auto-imports.d.ts', 'components.d.ts']),
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      globals: { ...globals.browser, ...autoImportGlobals },
    },
  },
  {
    files: ['build/runtime/check.ts', 'build/runtime/offline/register.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['build/runtime/offline/sw-template.js'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
  {
    files: ['*.{js,mjs,cjs}', 'build/*.ts', 'build/runtime/{env,offline,version}.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
