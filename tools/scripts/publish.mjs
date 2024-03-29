/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import devkit from '@nx/devkit';
import {execSync} from 'child_process';
import chalk from 'chalk';
import {writeFileSync} from 'node:fs';

function invariant(condition, message) {
    if (!condition) {
        console.error(chalk.bold.red(message));
        process.exit(1);
    }
}

// Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name] = process.argv;

const graph = devkit.readCachedProjectGraph();
const project = graph.nodes[name];

invariant(project, `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`);

const outputPath = project.data?.targets?.build?.options?.outputPath ?? project.data?.targets?.build?.outputs?.[0];

if (outputPath == null) {
    throw new Error('there is no output path for the project');
}

const packageJson = devkit.readJsonFile(`${devkit.workspaceRoot}/package.json`);

const actualOutputPath = outputPath.startsWith('{workspaceRoot}/') ? outputPath.slice('{workspaceRoot}/'.length) : outputPath;

invariant(actualOutputPath, `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`);

process.chdir(actualOutputPath);

// needed, so it does not complain this output dir for not being in the project workspace
writeFileSync('yarn.lock', '');
execSync(`volta run --yarn ${packageJson.volta.yarn} yarn install --mode=update-lockfile`, {encoding: 'utf8'});

// Execute "yarn npm publish" to publish
execSync(`volta run --yarn ${packageJson.volta.yarn} yarn npm publish`, {encoding: 'utf8'});
