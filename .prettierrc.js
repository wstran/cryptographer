module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // TypeScript specific
  parser: 'typescript',

  // Overrides for specific file types
  overrides: [
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 120
      }
    },
    {
      files: '*.yml',
      options: {
        parser: 'yaml',
        tabWidth: 2
      }
    },
    {
      files: '*.yaml',
      options: {
        parser: 'yaml',
        tabWidth: 2
      }
    }
  ]
};