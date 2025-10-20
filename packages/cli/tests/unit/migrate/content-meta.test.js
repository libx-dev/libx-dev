/**
 * content-meta.js のユニットテスト
 *
 * コンテンツメタ生成ロジックのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { generateContentMeta, generateAllContentMeta } from '../../../src/commands/migrate/content-meta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../../fixtures/migrate-from-libx/sample-small/apps/test-project');
const TEMP_DIR = resolve(__dirname, '../../tmp/content-meta');

describe('content-meta', () => {
  beforeEach(() => {
    // 一時ディレクトリを作成
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 一時ディレクトリをクリーンアップ
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  });

  describe('generateContentMeta', () => {
    it('正常なファイルからコンテンツメタを生成できる', () => {
      const document = {
        id: 'getting-started',
        _files: {
          'v1-en': {
            filePath: join(FIXTURES_DIR, 'src/content/docs/v1/en/01-guide/01-getting-started.mdx'),
            path: 'src/content/docs/v1/en/01-guide/01-getting-started.mdx',
          },
          'v1-ja': {
            filePath: join(FIXTURES_DIR, 'src/content/docs/v1/ja/01-guide/01-getting-started.mdx'),
            path: 'src/content/docs/v1/ja/01-guide/01-getting-started.mdx',
          },
        },
      };

      const content = generateContentMeta(FIXTURES_DIR, document, ['v1'], ['en', 'ja']);

      // 英語版のチェック
      expect(content.en).toBeDefined();
      expect(content.en.status).toBe('published');
      expect(content.en.path).toContain('content/getting-started/en.mdx');
      expect(content.en.syncHash).toBeDefined();
      expect(content.en.syncHash).toMatch(/^[0-9a-f]{64}$/); // SHA-256ハッシュ
      expect(content.en.wordCount).toBeGreaterThan(0);

      // 日本語版のチェック
      expect(content.ja).toBeDefined();
      expect(content.ja.status).toBe('published');
      expect(content.ja.path).toContain('content/getting-started/ja.mdx');
      expect(content.ja.syncHash).toBeDefined();
      expect(content.ja.wordCount).toBeGreaterThan(0);
    });

    it('ファイルが存在しない場合、status: "missing" を設定する', () => {
      const document = {
        id: 'nonexistent',
        _files: {}, // ファイル情報なし
      };

      const content = generateContentMeta(FIXTURES_DIR, document, ['v1'], ['en']);

      expect(content.en).toBeDefined();
      expect(content.en.status).toBe('missing');
    });

    it('draftフラグがある場合、status: "draft" を設定する', () => {
      // draftフラグ付きのMDXファイルを作成
      const draftDir = join(TEMP_DIR, 'src/content/docs/v1/en/01-guide');
      mkdirSync(draftDir, { recursive: true });

      const draftFile = join(draftDir, '01-draft.mdx');
      writeFileSync(
        draftFile,
        `---
title: Draft Document
description: This is a draft
draft: true
---

# Draft Document

This is a draft document.
`
      );

      const document = {
        id: 'draft',
        _files: {
          'v1-en': {
            filePath: draftFile,
            path: 'src/content/docs/v1/en/01-guide/01-draft.mdx',
          },
        },
      };

      const content = generateContentMeta(TEMP_DIR, document, ['v1'], ['en']);

      expect(content.en).toBeDefined();
      expect(content.en.status).toBe('draft');
    });

    it('inReviewフラグがある場合、status: "in-review" を設定する', () => {
      // inReviewフラグ付きのMDXファイルを作成
      const reviewDir = join(TEMP_DIR, 'src/content/docs/v1/en/01-guide');
      mkdirSync(reviewDir, { recursive: true });

      const reviewFile = join(reviewDir, '01-review.mdx');
      writeFileSync(
        reviewFile,
        `---
title: Review Document
description: This is under review
inReview: true
---

# Review Document

This document is under review.
`
      );

      const document = {
        id: 'review',
        _files: {
          'v1-en': {
            filePath: reviewFile,
            path: 'src/content/docs/v1/en/01-guide/01-review.mdx',
          },
        },
      };

      const content = generateContentMeta(TEMP_DIR, document, ['v1'], ['en']);

      expect(content.en).toBeDefined();
      expect(content.en.status).toBe('in-review');
    });

    it('wordCountがコードブロックを除外してカウントする', () => {
      // コードブロック付きのMDXファイルを作成
      const codeDir = join(TEMP_DIR, 'src/content/docs/v1/en/01-guide');
      mkdirSync(codeDir, { recursive: true });

      const codeFile = join(codeDir, '01-code.mdx');
      writeFileSync(
        codeFile,
        `---
title: Code Example
---

# Code Example

This is some text.

\`\`\`javascript
// This code should not be counted
function hello() {
  console.log('Hello, World!');
}
\`\`\`

More text here.
`
      );

      const document = {
        id: 'code',
        _files: {
          'v1-en': {
            filePath: codeFile,
            path: 'src/content/docs/v1/en/01-guide/01-code.mdx',
          },
        },
      };

      const content = generateContentMeta(TEMP_DIR, document, ['v1'], ['en']);

      expect(content.en).toBeDefined();
      expect(content.en.wordCount).toBeGreaterThan(0);
      // コードブロックを除外しているので、実際のテキスト量より少ないはず
      expect(content.en.wordCount).toBeLessThan(20); // "This is some text" + "More text here" = 約7語
    });
  });

  describe('generateAllContentMeta', () => {
    it('複数のドキュメントのコンテンツメタを生成できる', () => {
      const documents = [
        {
          id: 'getting-started',
          _files: {
            'v1-en': {
              filePath: join(FIXTURES_DIR, 'src/content/docs/v1/en/01-guide/01-getting-started.mdx'),
              path: 'src/content/docs/v1/en/01-guide/01-getting-started.mdx',
            },
          },
        },
        {
          id: 'installation',
          _files: {
            'v1-en': {
              filePath: join(FIXTURES_DIR, 'src/content/docs/v1/en/01-guide/02-installation.mdx'),
              path: 'src/content/docs/v1/en/01-guide/02-installation.mdx',
            },
          },
        },
      ];

      const result = generateAllContentMeta(FIXTURES_DIR, documents, ['v1'], ['en']);

      expect(result).toHaveLength(2);
      expect(result[0].content).toBeDefined();
      expect(result[0].content.en).toBeDefined();
      expect(result[0].content.en.status).toBe('published');
      expect(result[1].content).toBeDefined();
      expect(result[1].content.en).toBeDefined();
      expect(result[1].content.en.status).toBe('published');
    });

    it('エラーが発生しても処理を継続する', () => {
      const documents = [
        {
          id: 'valid',
          _files: {
            'v1-en': {
              filePath: join(FIXTURES_DIR, 'src/content/docs/v1/en/01-guide/01-getting-started.mdx'),
              path: 'src/content/docs/v1/en/01-guide/01-getting-started.mdx',
            },
          },
        },
        {
          id: 'invalid',
          _files: {
            'v1-en': {
              filePath: '/nonexistent/path.mdx',
              path: 'nonexistent/path.mdx',
            },
          },
        },
      ];

      // エラーが発生しても例外を投げないことを確認
      expect(() => {
        generateAllContentMeta(FIXTURES_DIR, documents, ['v1'], ['en']);
      }).not.toThrow();

      const result = generateAllContentMeta(FIXTURES_DIR, documents, ['v1'], ['en']);

      expect(result).toHaveLength(2);
      expect(result[0].content.en.status).toBe('published');
      // 2番目のドキュメントはファイルが存在しないため、status: "missing"
      expect(result[1].content.en.status).toBe('missing');
    });
  });
});
