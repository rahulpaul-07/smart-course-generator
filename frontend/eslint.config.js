import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...jsxA11y.configs.recommended.rules
    }
  },
  {
    // TypeScript already checks that every identifier resolves (and does it
    // correctly for type-only positions, ambient globals, etc). The base
    // no-undef rule predates TS-awareness and produces false positives on
    // .ts/.tsx files, so it's disabled there per typescript-eslint's own
    // guidance: https://typescript-eslint.io/rules/no-undef/
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-undef': 'off',
      // Superseded by @typescript-eslint/no-unused-vars, which understands
      // TS-only constructs (type-only imports, interface method params,
      // overload signatures) that the base rule flags incorrectly.
      'no-unused-vars': 'off',
    },
  },
])
