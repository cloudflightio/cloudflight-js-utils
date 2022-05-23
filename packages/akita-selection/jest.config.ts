/* eslint-disable */
export default {
    displayName: 'akita-selection',
    preset: '../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    transformIgnorePatterns: ['/node_modules/(?!(@datorama)/)'],
    moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
    coverageDirectory: '../../coverage/packages/akita-selection',
};
