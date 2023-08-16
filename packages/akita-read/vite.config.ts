/// <reference types="vitest" />
import {defineConfig} from 'vite';
import {fileURLToPath, URL} from 'node:url';

import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig({
    cacheDir: '../../node_modules/.vite/testx',

    plugins: [
        dts({
            entryRoot: 'src',
            tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
        }),

        nxViteTsPaths(),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points.
            entry: 'src/index.ts',
            name: 'testx',
            fileName: 'index',
            // Change this to the formats you want to support.
            // Don't forget to update your package.json as well.
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            // External packages that should not be bundled into your library.
            external: ['@cloudflight/rxjs-read'],
        },
    },
    resolve: {
        alias: {
            '@cloudflight/rxjs-read': fileURLToPath(new URL('../rxjs-read/src', import.meta.url)),
        },
    },

    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest',
        },
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        setupFiles: 'src/test-setup.ts',
    },
});
