// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  // デプロイ先のサイトURL
  site: 'https://libx.dev',
  // 統合サイトではルートパス
  base: '/',
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
      remarkPlugins: [],
      rehypePlugins: []
    })
  ],
  // 画像最適化設定（Astro標準のastro:assets使用）
  image: {
    // サービスプロバイダー設定（Sharp使用）
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    // リモート画像のドメイン許可リスト
    remotePatterns: []
  },
  vite: {
    resolve: {
      alias: {
        '@docs/generator': path.resolve(__dirname, '../generator/src'),
        '@docs/ui': path.resolve(__dirname, '../ui/src'),
        '@docs/versioning': path.resolve(__dirname, '../versioning/src'),
        '@docs/theme': path.resolve(__dirname, '../theme/src'),
        '@docs/i18n': path.resolve(__dirname, '../i18n/src'),
        // モノレポ内のappsディレクトリへのエイリアス
        '@apps': path.resolve(__dirname, '../../apps'),
      },
    },
    define: {
      // プロジェクトルートをビルド時に環境変数として注入
      // これによりレジストリファイルのパス解決が正しく動作する
      'import.meta.env.PROJECT_ROOT': JSON.stringify(path.resolve(__dirname, '../..'))
    },
    build: {
      // CSSとJSのパスを絶対パスに変更
      assetsInlineLimit: 0,
      cssCodeSplit: true, // CSSコード分割を有効化
      cssMinify: true, // CSSの最小化を有効化
      minify: 'esbuild', // JavaScriptの高速な最小化
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          // コード分割の最適化
          manualChunks(id) {
            // node_modules内のパッケージは vendor チャンクへ
            if (id.includes('node_modules')) {
              // 大きなライブラリは個別チャンクに分離
              if (id.includes('astro')) return 'vendor-astro';
              if (id.includes('shiki')) return 'vendor-shiki';
              return 'vendor';
            }
            // ワークスペースパッケージは機能別に分割
            if (id.includes('@docs/ui')) return 'ui';
            if (id.includes('@docs/generator')) return 'generator';
            if (id.includes('@docs/theme')) return 'theme';
            if (id.includes('@docs/i18n')) return 'i18n';
            if (id.includes('@docs/versioning')) return 'versioning';
            // Pagefind関連は search チャンクへ
            if (id.includes('pagefind') || id.includes('Search')) return 'search';
          }
        }
      },
      // ソースマップを無効化（プロダクションビルドの高速化）
      sourcemap: false
    },
  },
  // 多言語対応の設定
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: true
    }
  },
});
