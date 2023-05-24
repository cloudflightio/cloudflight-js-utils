import type {ExecutorContext} from '@nx/devkit';
import {Application, TSConfigReader} from 'typedoc';
import type {BuildExecutorSchema} from './schema';

declare module 'typedoc' {
    // options from typedoc-plugin-markdown
    interface TypeDocOptionMap {
        hidePageTitle: boolean;
        hideBreadcrumbs: boolean;
        publicPath: string;
        namedAnchors: boolean;
        allReflectionsHaveOwnDocument: boolean;
        filenameSeparator: string;
        entryDocument: string;
        hideInPageTOC: boolean;
        indexTitle: string;
        hideMembersSymbol: boolean;
        preserveAnchorCasing: boolean;
    }

    // options from typedoc-vitepress-theme
    interface TypeDocOptionMap {
        docsRoot: string;
    }
}

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext): Promise<{success: boolean}> {
    const app = new Application();

    app.options.addReader(new TSConfigReader());

    await app.bootstrapWithPlugins({
        entryPoints: [options.entryPoint],
        out: options.output,
        tsconfig: options.tsConfig,
        excludePrivate: true,
        excludeInternal: true,
        externalSymbolLinkMappings: options.externalSymbolLinkMappings ?? {},
        sort: ['source-order'],
        plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
        includeVersion: true,
        // typedoc-plugin-markdown configs
        hideInPageTOC: true,
        // typedoc-vitepress-theme configs
        docsRoot: 'apps/documentation/src',
    });

    const convertedProject = app.convert();

    if (convertedProject != null) {
        await app.generateDocs(convertedProject, options.output);

        return {
            success: true,
        };
    } else {
        return {
            success: false,
        };
    }
}
