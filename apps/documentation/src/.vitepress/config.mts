import {defineConfig, DefaultTheme} from 'vitepress';
import akitaReadItems from '../api/akita-read/typedoc-sidebar.json';
import angularDisplayItems from '../api/angular-display/typedoc-sidebar.json';
import angularLoggerItems from '../api/angular-logger/typedoc-sidebar.json';
import concurrencyUtilsItems from '../api/concurrency-utils/typedoc-sidebar.json';
import loggerItems from '../api/logger/typedoc-sidebar.json';
import rxjsReadItems from '../api/rxjs-read/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Cloudflight Js Utils',
    description: 'Documentation page for Cloudflight Js Utils',
    base: '/cloudflight-js-utils/',
    themeConfig: {
        sidebar: {
            '/api/akita-read/': [
                {
                    text: 'Akita Read',
                    link: '/api/akita-read/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(akitaReadItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
            '/api/angular-display/': [
                {
                    text: 'Angular Display',
                    link: '/api/angular-display/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(angularDisplayItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
            '/api/angular-logger/': [
                {
                    text: 'Angular Logger',
                    link: '/api/angular-logger/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(angularLoggerItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
            '/api/concurrency-utils/': [
                {
                    text: 'Concurrency Utils',
                    link: '/api/concurrency-utils/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(concurrencyUtilsItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
            '/api/logger/': [
                {
                    text: 'Logger',
                    link: '/api/logger/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(loggerItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
            '/api/rxjs-read/': [
                {
                    text: 'Rxjs Read',
                    link: '/api/rxjs-read/',
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    items: removeDuplicateItems(rxjsReadItems as unknown as DefaultTheme.SidebarItem[]),
                },
            ],
        },
        socialLinks: [{icon: 'github', link: 'https://github.com/cloudflightio/cloudflight-js-utils'}],
    },
    // we need to put it in the subfolder otherwise serving with Nx does not work correctly
    outDir: '../../../dist/apps/documentation/cloudflight-js-utils',
});

function removeDuplicateItems(items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] {
    return items.reduce<DefaultTheme.SidebarItem[]>((acc, item) => {
        if (acc.some((existingItem) => existingItem.link === item.link)) {
            return acc;
        }

        return [...acc, item];
    }, []);
}
