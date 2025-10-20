# @docs/i18n

国際化ユーティリティ - 多言語ドキュメントサイト用のi18nヘルパー

## 概要

`@docs/i18n`は、ドキュメントサイトの多言語対応を支援するユーティリティパッケージです。言語検出、翻訳ヘルパー、パス変換、ライセンステンプレートなどの機能を提供します。

## 主要機能

- **言語検出**: URLやブラウザ設定から現在の言語を取得
- **翻訳ヘルパー**: キーベースの翻訳機能
- **パス変換**: 言語切り替え時のURL変換
- **ライセンステンプレート**: 多言語ライセンス表示のサポート
- **15言語サポート**: en, ja, zh-Hans, zh-Hant, es, pt-BR, ko, de, fr, ru, ar, id, tr, hi, vi
- **TypeScript型サポート**: 完全な型定義

## インストール

```bash
pnpm add @docs/i18n
```

## 使用方法

### 言語検出

現在の言語を取得します。

```typescript
import { getLanguage } from '@docs/i18n';

// URLから言語を検出
const lang = getLanguage('/sample-docs/v2/ja/guide/getting-started');
console.log(lang); // 'ja'

// デフォルト言語
const defaultLang = getLanguage('/unknown/path');
console.log(defaultLang); // 'en'
```

### 翻訳ヘルパー

キーベースで翻訳を取得します。

```typescript
import { translate } from '@docs/i18n';

// 英語で翻訳
const enText = translate('welcome', 'en');
console.log(enText); // 'Welcome'

// 日本語で翻訳
const jaText = translate('welcome', 'ja');
console.log(jaText); // 'ようこそ'

// キーが存在しない場合はキーをそのまま返す
const unknownText = translate('unknown-key', 'en');
console.log(unknownText); // 'unknown-key'
```

### パス変換（言語切り替え）

言語切り替え時にURLを変換します。

```typescript
import { translatePath } from '@docs/i18n';

// 日本語から英語に切り替え
const enPath = translatePath(
  '/sample-docs/v2/ja/guide/getting-started',
  'en'
);
console.log(enPath); // '/sample-docs/v2/en/guide/getting-started'

// 英語から韓国語に切り替え
const koPath = translatePath(
  '/sample-docs/v2/en/api/reference',
  'ko'
);
console.log(koPath); // '/sample-docs/v2/ko/api/reference'
```

### ライセンステンプレート

ライセンス表示用のテンプレートを取得します。

```typescript
import {
  getLicenseTemplate,
  getLicenseTemplateKey,
  getLicenseCategory
} from '@docs/i18n';

// ライセンステンプレート取得
const template = getLicenseTemplate('MIT', 'ja');
console.log(template);
// 'このプロジェクトはMITライセンスの下で公開されています。'

// ライセンステンプレートキー取得
const key = getLicenseTemplateKey('Apache-2.0');
console.log(key); // 'license.apache-2.0'

// ライセンスカテゴリ判定
const category = getLicenseCategory('MIT');
console.log(category); // 'permissive'
```

## API

### getLanguage(url: string): LocaleKey

URLから言語を検出します。

**パラメータ**:
- `url` (string): URLパス（例: `/sample-docs/v2/ja/guide`）

**戻り値**: LocaleKey - 言語コード（例: `'ja'`, `'en'`）

**例**:
```typescript
getLanguage('/sample-docs/v2/ja/guide'); // 'ja'
getLanguage('/test-docs/v1/en/api'); // 'en'
getLanguage('/unknown'); // 'en' (デフォルト)
```

### translate(key: string, locale: LocaleKey): string

キーに対応する翻訳を取得します。

**パラメータ**:
- `key` (string): 翻訳キー（例: `'welcome'`, `'404.title'`）
- `locale` (LocaleKey): 言語コード（例: `'ja'`, `'en'`）

**戻り値**: string - 翻訳されたテキスト（キーが見つからない場合はキーをそのまま返す）

**例**:
```typescript
translate('welcome', 'ja'); // 'ようこそ'
translate('welcome', 'en'); // 'Welcome'
translate('404.title', 'ja'); // 'ページが見つかりません'
```

### translatePath(currentPath: string, targetLocale: LocaleKey): string

言語切り替え時にパスを変換します。

**パラメータ**:
- `currentPath` (string): 現在のURLパス
- `targetLocale` (LocaleKey): 切り替え先の言語コード

**戻り値**: string - 変換されたURLパス

**例**:
```typescript
translatePath('/sample-docs/v2/ja/guide', 'en');
// '/sample-docs/v2/en/guide'

translatePath('/test-docs/v1/en/api', 'ko');
// '/test-docs/v1/ko/api'
```

### getLicenseTemplate(licenseType: string, locale: LocaleKey): string

ライセンステンプレートを取得します。

**パラメータ**:
- `licenseType` (string): ライセンスタイプ（例: `'MIT'`, `'Apache-2.0'`）
- `locale` (LocaleKey): 言語コード

**戻り値**: string - ライセンステンプレート

**例**:
```typescript
getLicenseTemplate('MIT', 'ja');
// 'このプロジェクトはMITライセンスの下で公開されています。'

getLicenseTemplate('Apache-2.0', 'en');
// 'This project is licensed under the Apache License 2.0.'
```

### getLicenseTemplateKey(licenseType: string): string

ライセンステンプレートのキーを取得します。

**パラメータ**:
- `licenseType` (string): ライセンスタイプ

**戻り値**: string - 翻訳キー

**例**:
```typescript
getLicenseTemplateKey('MIT'); // 'license.mit'
getLicenseTemplateKey('Apache-2.0'); // 'license.apache-2.0'
```

### getLicenseCategory(licenseType: string): 'permissive' | 'copyleft' | 'proprietary'

ライセンスのカテゴリを判定します。

**パラメータ**:
- `licenseType` (string): ライセンスタイプ

**戻り値**: `'permissive'` | `'copyleft'` | `'proprietary'`

**例**:
```typescript
getLicenseCategory('MIT'); // 'permissive'
getLicenseCategory('GPL-3.0'); // 'copyleft'
getLicenseCategory('Proprietary'); // 'proprietary'
```

## サポート言語

| 言語コード | 言語名 | 説明 |
|-----------|--------|------|
| `en` | English | 英語（デフォルト） |
| `ja` | 日本語 | Japanese |
| `zh-Hans` | 简体中文 | Simplified Chinese |
| `zh-Hant` | 繁體中文 | Traditional Chinese |
| `es` | Español | Spanish |
| `pt-BR` | Português (Brasil) | Portuguese (Brazil) |
| `ko` | 한국어 | Korean |
| `de` | Deutsch | German |
| `fr` | Français | French |
| `ru` | Русский | Russian |
| `ar` | العربية | Arabic |
| `id` | Bahasa Indonesia | Indonesian |
| `tr` | Türkçe | Turkish |
| `hi` | हिन्दी | Hindi |
| `vi` | Tiếng Việt | Vietnamese |

## 翻訳ファイル

翻訳は`src/locales/`ディレクトリのJSONファイルで管理されています。

### ファイル構造

```
packages/i18n/src/locales/
├── en.json
├── ja.json
├── zh-Hans.json
├── zh-Hant.json
├── es.json
├── pt-BR.json
├── ko.json
├── de.json
├── fr.json
├── ru.json
├── ar.json
├── id.json
├── tr.json
├── hi.json
└── vi.json
```

### 翻訳ファイルの例

**en.json**:
```json
{
  "welcome": "Welcome",
  "404.title": "Page Not Found",
  "404.description": "The page you are looking for does not exist.",
  "license.mit": "This project is licensed under the MIT License."
}
```

**ja.json**:
```json
{
  "welcome": "ようこそ",
  "404.title": "ページが見つかりません",
  "404.description": "お探しのページは存在しません。",
  "license.mit": "このプロジェクトはMITライセンスの下で公開されています。"
}
```

### 新しい翻訳の追加

1. 該当する言語のJSONファイルを編集
2. キーと値を追加
3. すべての言語ファイルに同じキーを追加（一貫性のため）

**例**:
```json
{
  "new.feature": "New Feature",
  "new.feature.description": "This is a new feature."
}
```

## 使用例

### Astroコンポーネントでの使用

```astro
---
import { getLanguage, translate } from '@docs/i18n';

const currentPath = Astro.url.pathname;
const lang = getLanguage(currentPath);
const welcomeText = translate('welcome', lang);
const notFoundTitle = translate('404.title', lang);
---

<h1>{welcomeText}</h1>
<p>{notFoundTitle}</p>
```

### 言語切り替えボタン

```astro
---
import { getLanguage, translatePath } from '@docs/i18n';
import { supportedLocales } from '@docs/i18n/locales';

const currentPath = Astro.url.pathname;
const currentLang = getLanguage(currentPath);
---

<div class="language-switcher">
  {supportedLocales.map(locale => (
    <a
      href={translatePath(currentPath, locale)}
      class={currentLang === locale ? 'active' : ''}
    >
      {locale}
    </a>
  ))}
</div>
```

### ライセンス表示

```astro
---
import { getLicenseTemplate } from '@docs/i18n';

const lang = 'ja';
const licenseText = getLicenseTemplate('MIT', lang);
---

<footer>
  <p>{licenseText}</p>
  <a href="/license">詳細を見る</a>
</footer>
```

## 配布形態

### ビルド成果物

`@docs/i18n`はTypeScriptをビルドして配布します。

**package.json**:
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

### ビルド

```bash
# ビルド実行
pnpm build

# ビルド成果物確認
ls -la dist/
# index.js, index.cjs, index.d.ts
```

## 開発

### ディレクトリ構造

```
packages/i18n/
├── src/
│   ├── index.ts
│   ├── utils/
│   │   ├── getLanguage.ts    # 言語検出
│   │   ├── translate.ts      # 翻訳ヘルパー
│   │   ├── translatePath.ts  # パス変換
│   │   ├── license.ts        # ライセンステンプレート
│   │   └── index.ts
│   └── locales/
│       ├── en.json
│       ├── ja.json
│       ├── ...
│       └── index.ts
├── dist/                      # ビルド成果物
├── tsup.config.ts             # tsupビルド設定
├── package.json
└── README.md
```

### 新しい言語の追加

1. `src/locales/`に新しいJSONファイルを作成（例: `de.json`）
2. `src/locales/index.ts`にインポートとエクスポートを追加
3. すべての翻訳キーを新しい言語で翻訳
4. `supportedLocales`配列に言語コードを追加

## 参考資料

- [i18next](https://www.i18next.com/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## ライセンス

MIT License

このパッケージはlibx-devプロジェクトの一部です。
