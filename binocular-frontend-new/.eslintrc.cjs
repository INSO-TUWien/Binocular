module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unsafe-return':0,
    '@typescript-eslint/no-unsafe-assignment':0,
    '@typescript-eslint/no-unsafe-call':0,
    '@typescript-eslint/no-unsafe-member-access':0,
    '@typescript-eslint/no-unsafe-argument':0,
    'prettier/prettier':[
      'error',
      {
        singleQuote: true,
        printWidth: 140,
        jsxBracketSameLine: true
      },
      ]
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
