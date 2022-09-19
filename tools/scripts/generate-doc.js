const TypeDoc = require('typedoc');

const projects = new Map([
  [
    'angular-logger',
    {
      config: 'packages/angular-logger/tsconfig.lib.json',
      entryPoints: ['packages/angular-logger/src/index.ts'],
      out: 'apps/documentation/src/api/angular-logger',
    },
  ],
  [
    'angular-teleport',
    {
      config: 'packages/angular-teleport/tsconfig.lib.json',
      entryPoints: ['packages/angular-teleport/src/index.ts'],
      out: 'apps/documentation/src/api/angular-teleport',
    },
  ],
  [
    'logger',
    {
      config: 'packages/logger/tsconfig.lib.json',
      entryPoints: ['packages/logger/src/index.ts'],
      out: 'apps/documentation/src/api/logger',
    },
  ],
]);

main().catch(console.error);

async function main() {
  const args = process.argv.slice(2);

  if (args[0] !== '--project') {
    return;
  }

  const project = args[1] != null ? projects.get(args[1]) : undefined;

  if (project != null) {
    await generateDoc(project);
  }
}

/**
 * @param project { {entryPoints: string[], config: string, out: string }}
 * @returns {Promise<void>}
 */
async function generateDoc(project) {
  const app = new TypeDoc.Application();

  app.options.addReader(new TypeDoc.TSConfigReader());

  app.bootstrap({
    entryPoints: project.entryPoints,
    out: project.out,
    tsconfig: project.config,
    excludePrivate: true,
    excludeInternal: true,
    sort: ['source-order'],
    // typedoc-plugin-markdown configs
    hideInPageTOC: true,
    // uncomment when developing docs to prevent
    // typedoc runs from crashing vuepress
    // cleanOutputDir: false,
  });

  const convertedProject = app.convert();

  if (convertedProject != null) {
    await app.generateDocs(convertedProject, project.out);
  }
}
