module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'rules': {
    'require-jsdoc': 0,
    'max-len': 0,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/typedef": [
      "error",
      {
        // "variableDeclaration": true,
        "memberVariableDeclaration": true,
        "parameter": true,
        "propertyDeclaration": true,
        "variableDeclarationIgnoreFunction": true
      }
    ]
  },
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "ignorePatterns": ['dist/*', 'node_modules/*']
};
