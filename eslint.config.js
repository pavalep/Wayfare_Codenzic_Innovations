const {defineConfig} = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * ESLint flat config.
 *
 * The one rule this project adds on top of the Expo defaults is the
 * raw-colour ban.
 *
 * WHY
 *
 * The whole point of `src/theme/tokens.ts` is that there is exactly
 * one place a colour can live. Without a rule enforcing it, the
 * tokens rot: one inline `#F1521F` in a screen and the brand colour
 * is now two values that drift apart. The rule makes the discipline
 * mechanical instead of aspirational.
 *
 * The escape hatch is the `overrides` block below — `src/theme/` and
 * `src/constants/` are where literals are ALLOWED, because those are
 * the definitions.
 */
module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'design-reference/**',
      '.design/**',
      // A relocated Gradle home. It is git-ignored, but ESLint's flat
      // config does NOT read .gitignore — it only lints what the
      // `files` patterns below match, and the Gradle cache ships
      // vendored .js files that fail every JS rule in the Expo
      // preset. Without this line, `eslint .` reports hundreds of
      // errors that have nothing to do with this project.
      '.gradle-home/**',
      'artifacts/**',
    ],
  },
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Property[key.name=/^(color|backgroundColor|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|shadowColor|textShadowColor|tintColor|overlayColor)$/] > Literal[value=/^#(?:[0-9A-Fa-f]{3}){1,2}$|^rgba?\\(/]",
          message:
            'Raw colour literals are banned — use a design token from src/theme/tokens.ts.',
        },
        {
          selector:
            "JSXAttribute[name.name=/^(color|backgroundColor|borderColor|tintColor|overlayColor)$/] > Literal[value=/^#(?:[0-9A-Fa-f]{3}){1,2}$|^rgba?\\(/]",
          message:
            'Raw colour literals are banned — use a design token from src/theme/tokens.ts.',
        },
      ],
    },
  },
  {
    // The token definitions are the ONLY place literals are allowed.
    files: ['src/theme/**/*.{ts,tsx}', 'src/constants/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Tests assert on raw colours and inline styles on purpose.
    //
    // `require()` is allowed inside a test body because it is how a
    // test gets a FRESH copy of a module: `jest.resetModules()` clears
    // the registry, and only a `require()` inside the test body picks
    // the new copy up. A top-level `import` would be hoisted and bound
    // to the original instance.
    files: ['__tests__/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
      'react-native/no-inline-styles': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/first': 'off',
    },
  },
  {
    // The Jest config and setup files run OUTSIDE a test file, so the
    // Jest globals are not in scope for them by default.
    files: ['jest.config.js', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]);
