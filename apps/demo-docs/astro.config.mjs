// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkLinkTransformer } from '../../scripts/plugins/remark-link-transformer.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  // デプロイ先のサイトURL
  site: 'https://libx.dev',
  // Cloudflare Pagesカスタムドメインのベースパス
  base: '/docs/demo-docs',
  integrations: [
    mdx({
      // シンタックスハイライトの設定
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        langs: [],
        wrap: true
      },
      // MDXの設定
      remarkPlugins: [
        [remarkLinkTransformer, { baseUrl: '/docs/demo-docs' }]
      ],
      rehypePlugins: []
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@docs/generator': path.resolve(__dirname, '../../packages/generator/src'),
        '@docs/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@docs/versioning': path.resolve(__dirname, '../../packages/versioning/src'),
        '@docs/search': path.resolve(__dirname, '../../packages/search/src'),
        '@docs/theme': path.resolve(__dirname, '../../packages/theme/src'),
        '@docs/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
        '@docs/runtime': path.resolve(__dirname, '../../packages/runtime/src'),
      },
    },
    build: {
      // CSSとJSのパスを絶対パスに変更
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        }
      }
    },
  },
});
