module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'no-useless-escape': 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'react-hooks/exhaustive-deps': 'warn'
      }
    }
  ]
};
