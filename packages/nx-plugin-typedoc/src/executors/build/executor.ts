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
}

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext): Promise<{success: boolean}> {
    const app = new Application();

    app.options.addReader(new TSConfigReader());

    app.bootstrap({
        entryPoints: [options.entryPoint],
        out: options.output,
        tsconfig: options.tsConfig,
        excludePrivate: true,
        excludeInternal: true,
        externalSymbolLinkMappings: options.externalSymbolLinkMappings ?? {},
        sort: ['source-order'],
        plugin: ['typedoc-plugin-markdown'],
        includeVersion: true,
        // typedoc-plugin-markdown configs
        hideInPageTOC: true,
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
