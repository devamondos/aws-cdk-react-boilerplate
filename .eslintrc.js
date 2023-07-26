module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'no-console': 0,
    'jsx-a11y/media-has-caption': 0,
    'jsx-a11y/alt-text': 0,
    'import/extensions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'import/no-unresolved': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': 0,
    'prettier/prettier': 2,
    'react/jsx-wrap-multilines': 0,
    'implicit-arrow-linebreak': 0,
    'operator-linebreak': 0,
    'no-multi-str': 0,
  },
};
