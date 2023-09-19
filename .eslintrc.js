require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: ['prettier'],
    ignorePatterns: ['**/*'],
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: ['packages/**/tsconfig.*?.json', 'tsconfig.*?.json'],
            },
        },
    },
    plugins: ['@nx', '@cloudflight/typescript'],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
            rules: {
                '@nx/enforce-module-boundaries': [
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
                'plugin:@nx/typescript',
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
            extends: ['plugin:@nx/javascript'],
            rules: {},
        },
        {
            files: '*.json',
            parser: 'jsonc-eslint-parser',
            rules: {
                '@nx/dependency-checks': [
                    'error',
                    {
                        ignoredFiles: ['{projectRoot}/vite.config.ts', 'packages/nx-plugin-typedoc/src/executors/build/executor.ts'],
                        ignoredDependencies: ['vitest', 'symbol-observable', 'tslib'],
                    },
                ],
            },
        },
        {
            files: ['*.spec.ts'],
            rules: {
                'no-magic-numbers': 'off',
            },
        },
    ],
};
