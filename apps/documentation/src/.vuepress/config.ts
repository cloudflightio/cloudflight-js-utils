import { webpackBundler } from '@vuepress/bundler-webpack';
import { defineUserConfig } from 'vuepress';

export default defineUserConfig({
  title: 'Cloudflight Js Utils',
  bundler: webpackBundler({
    postcss: {},
    vue: {},
  }),
});
