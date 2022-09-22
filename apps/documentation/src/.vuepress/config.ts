import { webpackBundler } from '@vuepress/bundler-webpack';
import { defineUserConfig } from 'vuepress';

export default defineUserConfig({
  title: 'Cloudflight Js Utils',
  dest: 'dist/apps/documentation',
  bundler: webpackBundler({
    postcss: {},
    vue: {},
  }),
});
