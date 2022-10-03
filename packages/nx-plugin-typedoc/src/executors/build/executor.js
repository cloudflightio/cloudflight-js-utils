// This file is needed as a workaround of https://github.com/nrwl/nx/issues/9823
const { workspaceRoot } = require('nx/src/utils/workspace-root');
const { registerTsProject } = require('nx/src/utils/register');

registerTsProject(workspaceRoot, 'tsconfig.base.json');

module.exports = require('./executor.ts');
