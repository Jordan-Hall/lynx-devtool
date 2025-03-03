module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },

  // Inherit other configurations
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: [
    '@typescript-eslint',
    'react',
    'prettier',
  ],

  rules: {
    'no-console': 1,
    'no-unused-vars': 1,
    'prettier/prettier': 2,

    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0,

    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-explicit-any': 1,
  },
  
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'no-unused-expressions': 0,
      },
    },
  ],

  settings: {
    react: {
      version: 'detect',
    },
  },
} 