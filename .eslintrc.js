require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['packages/**/tsconfig.*?.json', 'tsconfig.*?.json'],
      },
    },
  },
  plugins: ['@nrwl/nx', '@cloudflight/typescript'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nrwl/nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: 'angular',
                onlyDependOnLibsWithTags: ['js', 'angular'],
              },
              {
                sourceTag: 'js',
                onlyDependOnLibsWithTags: ['js'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@nrwl/nx/typescript',
        'plugin:@cloudflight/typescript/recommended',
        'plugin:@cloudflight/angular/recommended-typescript',
      ],
      rules: {},
    },
    {
      files: ['*.html'],
      extends: ['plugin:@cloudflight/angular/recommended-html'],
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nrwl/nx/javascript'],
      rules: {},
    },
    {
      files: '*.json',
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
  ],
};
