module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended', 'airbnb', 'plugin:prettier/recommended', 'plugin:storybook/recommended'],
  overrides: [
    {
      files: [
        '**/*.stories.*'
      ],
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', 'prettier'],
  rules: {
    quotes: [2, 'single'],
    // 单引号
    semi: [2, 'never'],
    // 不使用分号
    'space-before-function-paren': [2, 'always'],
    // 函数前面加上空格
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'consistent-return': 'off',
    'react/forbid-prop-types': 'off',
    'react/jsx-filename-extension': 'off',
    'prettier/prettier': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'eslint-disable-next-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'camelcase': 'off',
    'react/destructuring-assignment': 'off',
    'no-inner-declarations': 'off',
    'no-new': 'off',
    'no-unused-vars': 'off',
    'default-case': 'off'
  }
}
