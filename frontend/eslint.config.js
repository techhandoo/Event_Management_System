// ESLint 9 flat config. The previous setup was broken: ESLint v9 requires a
// flat config file, so `npm run lint` had been failing silently. Kept lean on
// purpose: the rules that catch real bugs (unused vars, hook rules) — tsc
// already enforces type-level hygiene.
import js from '@eslint/js';
import globals from 'globals';
import tsparser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    // JSX files are .tsx with the automatic runtime; js.configs.recommended's
    // no-undef would flag React/JSX intrinsics — TypeScript checks those too.
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      'no-undef': 'off', // tsc owns undefined-symbol checks; no-undef false-positives on TS type globals (React.FormEvent)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
