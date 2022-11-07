import { webpackBundler } from '@vuepress/bundler-webpack';
import { defineUserConfig } from 'vuepress';

export default defineUserConfig({
  title: 'Cloudflight Js Utils',
  base: '/cloudflight-js-utils/',
  // we need to put it in the subfolder otherwise serving with Nx does not work correctly
  dest: 'dist/apps/documentation/cloudflight-js-utils',
  bundler: webpackBundler({
    postcss: {},
    vue: {},
  }),
});
