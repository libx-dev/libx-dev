# libx-devプロジェクト：ライセンスガイドライン

このドキュメントは、libx-devプロジェクトにおいて技術文書を追加する際のライセンス基準を定めるものです。オープンソースソフトウェア（OSS）の文書翻訳・再配布に関する法的要件を整理し、プロジェクトに安全に追加できる文書の判定基準を提供します。

## 概要

libx-devプロジェクトは、主にOSSのドキュメントを翻訳し、技術的な情報を母語で学習できるようにすることを目的としています。そのため、翻訳と再配布が法的に許可されているライセンスの下で公開されている文書のみを扱う必要があります。

## ライセンス分類

### 1. 推奨ライセンス（Permissive Licenses）

翻訳・再配布が自由に行えるライセンスです。これらのライセンスの下で公開されている文書は、適切な帰属表示を行うことでプロジェクトに追加可能です。

#### MIT License

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 元の著作権表示とライセンス文の保持
- **商用利用**: 許可
- **特徴**: 最も制約の少ないライセンスの一つ

#### BSD License（2条項・3条項）

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 著作権表示とライセンス条項の保持
- **商用利用**: 許可
- **特徴**: MITライセンスと同様に制約が少ない

#### Apache License 2.0

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 著作権表示、ライセンス文、変更の明記
- **商用利用**: 許可
- **特徴**: 明示的な特許ライセンスを含む

#### Creative Commons Attribution (CC BY)

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 作者名、ライセンス、元作品へのリンク
- **商用利用**: 許可
- **特徴**: 創作物に特化したライセンス

#### Public Domain / CC0

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 不要（推奨はされる）
- **商用利用**: 許可
- **特徴**: 著作権を放棄、最も自由なライセンス

#### zlib License

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 著作権表示とライセンス文の保持
- **商用利用**: 許可
- **特徴**: ソフトウェアライブラリ向け、改変時の誤解を招く表示を禁止

#### Boost Software License 1.0 (BSL-1.0)

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 著作権表示（配布時のみ）
- **商用利用**: 許可
- **特徴**: C++ライブラリで人気、非常にpermissive、使用時の表示義務なし

#### ISC License

- **翻訳・再配布**: 完全に許可
- **必要な表示**: 著作権表示とライセンス文の保持
- **商用利用**: 許可
- **特徴**: MITライセンスとほぼ同等、より簡潔な文言

### 2. 条件付きライセンス（Copyleft Licenses）

これらのライセンスの下では翻訳・再配布は可能ですが、派生作品も同じライセンスで配布する必要があります。注意深い検討が必要です。

#### GNU General Public License (GPL) v2/v3

- **翻訳・再配布**: 許可（同一ライセンスでの配布が条件）
- **必要な表示**: 著作権表示、ライセンス全文
- **商用利用**: 許可
- **制約**: 派生作品もGPLで配布する必要

#### GNU Free Documentation License (GFDL)

- **翻訳・再配布**: 許可（文書専用ライセンス）
- **必要な表示**: 著作権表示、変更履歴、不変部分の保持
- **商用利用**: 許可
- **制約**: 派生文書もGFDLで配布

#### Creative Commons Share-Alike (CC BY-SA)

- **翻訳・再配布**: 許可
- **必要な表示**: 作者名、ライセンス、変更の明記
- **商用利用**: 許可
- **制約**: 派生作品も同じライセンスで配布

#### Mozilla Public License 2.0 (MPL-2.0)

- **翻訳・再配布**: 許可
- **必要な表示**: 著作権表示、ライセンス文
- **商用利用**: 許可
- **制約**: ファイルレベルのコピーレフト（変更されたファイルのみMPL継承）
- **特徴**: 弱いコピーレフト、企業とOSSコミュニティの中間的選択

#### Eclipse Public License 2.0 (EPL-2.0)

- **翻訳・再配布**: 許可
- **必要な表示**: 著作権表示、ライセンス文
- **商用利用**: 許可
- **制約**: ファイルレベルのコピーレフト
- **特徴**: Javaエコシステムで人気、企業での法的保護を強化

#### LaTeX Project Public License (LPPL)

- **翻訳・再配布**: 許可
- **必要な表示**: 著作権表示、変更履歴
- **商用利用**: 許可
- **制約**: 変更されたファイルには新しい名前が必要
- **特徴**: LaTeX/TeX特化、学術出版分野で標準

### 3. 制限付きライセンス（要注意）

これらのライセンスには重要な制限があり、プロジェクトの目的に適さない場合があります。

#### Creative Commons Non-Commercial (CC BY-NC系)

- **翻訳・再配布**: 非営利目的のみ許可
- **制約**: 商用利用禁止
- **判定**: プロジェクトの性質により要検討

#### Creative Commons No-Derivatives (CC BY-ND系)

- **翻訳・再配布**: 元作品そのままのみ許可
- **制約**: 翻訳や改変が禁止
- **判定**: 翻訳プロジェクトには不適

### 4. 禁止ライセンス

以下のライセンスや条件の文書はプロジェクトに追加できません。

#### All Rights Reserved

- 明示的な許可がない限り、翻訳・再配布は著作権侵害

#### Proprietary Licenses

- 独占的ライセンスで、通常は翻訳・再配布が禁止

#### 不明確なライセンス

- ライセンス条項が明記されていない文書

## プロジェクト追加時のチェックリスト

新しい文書をプロジェクトに追加する前に、以下の項目を確認してください：

### 1. ライセンスの確認

- [ ] 文書に明確なライセンス表示があるか
- [ ] そのライセンスが翻訳・再配布を許可しているか
- [ ] 商用利用の可否がプロジェクトの方針と合致するか

### 2. 必要な表示の準備

- [ ] 元の著作権者情報を収集
- [ ] 必要なライセンス文を確認
- [ ] 帰属表示の方法を決定

### 3. 追加条件の確認

- [ ] 派生作品のライセンス継承要件
- [ ] 変更内容の明記義務
- [ ] その他の特別な条件

### 4. リスク評価

- [ ] 法的リスクの評価
- [ ] プロジェクトの持続可能性への影響
- [ ] 将来的な利用制限の可能性

## 運用指針

### ライセンス判定の流れ

1. **第一次判定**: 文書のライセンス表示を確認
2. **分類判定**: 上記のライセンス分類に従って分類
3. **適格性判定**: プロジェクトの目的との適合性を評価
4. **リスク評価**: 法的リスクと実用性を総合的に判断
5. **最終決定**: プロジェクトへの追加可否を決定

### グレーゾーンへの対応

不明確なライセンス状況の場合：

1. **権利者への問い合わせ**: 直接許可を求める
2. **法的助言の取得**: 必要に応じて専門家に相談
3. **保守的な判断**: 疑わしい場合は追加を見送る

### 継続的な監視

- ライセンス条項の変更を定期的に確認
- 法的環境の変化への対応
- プロジェクト方針の見直し

## 実装上の注意点

### i18nベース自動ライセンス表示システム（現在の方式）

libx-devプロジェクトでは、ライセンス情報を`project.config.json`で管理し、`packages/i18n`の多言語テンプレートシステムを使用して自動的に適切なライセンス表示を生成します。

#### project.config.jsonでの設定（簡素化版）

```json
{
  "licensing": {
    "sources": [
      {
        "id": "source-id",
        "name": "Original Documentation",
        "author": "Original Author",
        "license": "MIT",
        "licenseUrl": "https://opensource.org/licenses/MIT",
        "sourceUrl": "https://github.com/example/original-repo"
      }
    ],
    "defaultSource": "source-id",
    "showAttribution": true
  }
}
```

#### ライセンス別自動テンプレート選択

システムは`license`フィールドの値に基づいて適切なテンプレートを自動選択します。以下は各ライセンスの設定例と推奨`licenseUrl`です：

##### Permissive Licenses (minimal テンプレート)

**MIT License**
```json
{
  "license": "MIT",
  "licenseUrl": "https://opensource.org/licenses/MIT"
}
```

**Apache License 2.0**
```json
{
  "license": "Apache License 2.0",
  "licenseUrl": "https://www.apache.org/licenses/LICENSE-2.0"
}
```

**BSD-3-Clause**
```json
{
  "license": "BSD-3-Clause",
  "licenseUrl": "https://opensource.org/licenses/BSD-3-Clause"
}
```

**ISC License**
```json
{
  "license": "ISC",
  "licenseUrl": "https://opensource.org/licenses/ISC"
}
```

**Boost Software License**
```json
{
  "license": "BSL-1.0",
  "licenseUrl": "https://www.boost.org/LICENSE_1_0.txt"
}
```

##### Specialized Templates

**Zlib License (zlib テンプレート)**
```json
{
  "license": "Zlib",
  "licenseUrl": "https://opensource.org/licenses/Zlib"
}
```

**Mozilla Public License 2.0 (mpl テンプレート)**
```json
{
  "license": "MPL-2.0",
  "licenseUrl": "https://www.mozilla.org/en-US/MPL/2.0/"
}
```

**Eclipse Public License 2.0 (epl テンプレート)**
```json
{
  "license": "EPL-2.0",
  "licenseUrl": "https://www.eclipse.org/legal/epl-2.0/"
}
```

**LaTeX Project Public License (lppl テンプレート)**
```json
{
  "license": "LPPL",
  "licenseUrl": "https://www.latex-project.org/lppl/"
}
```

##### Creative Commons (cc-by / cc-by-sa テンプレート)

**CC BY 4.0**
```json
{
  "license": "CC BY 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
}
```

**CC BY-SA 4.0**
```json
{
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
}
```

##### Copyleft Licenses (copyleft テンプレート)

**GNU GPL v3.0**
```json
{
  "license": "GPL-3.0",
  "licenseUrl": "https://www.gnu.org/licenses/gpl-3.0.html"
}
```

**GNU LGPL v3.0**
```json
{
  "license": "LGPL-3.0",
  "licenseUrl": "https://www.gnu.org/licenses/lgpl-3.0.html"
}
```

**GNU AGPL v3.0**
```json
{
  "license": "AGPL-3.0",
  "licenseUrl": "https://www.gnu.org/licenses/agpl-3.0.html"
}
```

**GNU Free Documentation License**
```json
{
  "license": "GFDL",
  "licenseUrl": "https://www.gnu.org/licenses/fdl-1.3.html"
}
```

##### Public Domain (public-domain テンプレート)

**CC0 1.0 Universal**
```json
{
  "license": "CC0",
  "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/"
}
```

**Public Domain**
```json
{
  "license": "Public Domain",
  "licenseUrl": ""  // Public Domainの場合はURLなしでも可
}
```

**WTFPL**
```json
{
  "license": "WTFPL",
  "licenseUrl": "http://www.wtfpl.net/"
}
```

#### テンプレート選択のロジック

システムは以下の順序でテンプレートを選択します：

1. **完全一致**: `LICENSE_TEMPLATE_MAP`内の完全一致を優先
2. **部分一致**: ライセンス名の部分文字列による判定
3. **デフォルト**: 不明な場合は`minimal`テンプレートを使用

#### 個別文書でのオーバーライド（オプション）

特別なケースのみ、MDXフロントマターで設定をオーバーライド可能：

```markdown
---
title: "文書タイトル"
licenseSource: "other-source-id"  # 別のソースを使用
customAttribution: "カスタム帰属表示"  # 固有の帰属表示
hideAttribution: true  # この文書のみ帰属表示を無効化
---
```

### フォルダ構造での管理

```
apps/[project]/
├── src/
│   ├── config/
│   │   └── project.config.json   # ライセンス情報を含む
│   └── content/
│       └── docs/
│           └── [version]/
│               └── [lang]/
│                   └── 01-guide/
│                       └── 01-getting-started.mdx
└── LICENSE  # プロジェクトライセンス（オプション）
```

### 自動化ツールの活用

#### i18nベース自動ライセンス表示システム

libx-devプロジェクトでは以下の高度な自動化機能を提供します：

- **自動ライセンス判定**: ライセンス名から適切なテンプレートを自動選択
- **多言語テンプレート**: `packages/i18n`で一元管理された15言語対応
- **法的適合性**: 9種類のテンプレートによるライセンス種別に応じた適切な帰属表記の自動生成
- **設定の簡素化**: 最小限の情報でプロフェッショナルな表示
- **包括的ライセンス対応**: GitHub上で採用率の高い主要ライセンスを網羅

#### サポートされるライセンス・テンプレート

| ライセンス種別 | 自動選択テンプレート | 特徴 |
|---------------|---------------------|------|
| MIT、Apache、BSD、ISC、Boost | `minimal` | シンプルな1行表示 |
| Zlib、zlib/libpng | `zlib` | Zlib固有の帰属表記 |
| Mozilla Public License 2.0 | `mpl` | MPL固有の弱いコピーレフト表記 |
| Eclipse Public License 2.0 | `epl` | EPL固有の弱いコピーレフト表記 |
| LaTeX Project Public License | `lppl` | LPPL固有の表記（ファイル名変更要件） |
| CC BY | `cc-by` | 帰属要件を明記 |
| CC BY-SA | `cc-by-sa` | 継承要件も含む |
| GPL、GFDL、AGPL、LGPL | `copyleft` | 強いコピーレフト注意書き |
| CC0、Public Domain、WTFPL | `public-domain` | 最小限の表示 |

#### 使用方法

```astro
<!-- フッターでの自動表示（推奨） -->
<Footer 
  showLicenseAttribution={true}
  projectConfig={projectConfig}
  lang={currentLang}
/>

<!-- 個別ページでの表示 -->
<LicenseAttribution 
  projectConfig={projectConfig}
  lang={currentLang}
  licenseSource="specific-source"
/>
```

#### 新システムのメリット

- **完全自動化**: ライセンス名を指定するだけで適切な表示を生成
- **法的正確性**: ライセンス種別に応じた適切な帰属表記
- **国際化対応**: 15言語での正確な翻訳を提供
- **保守性向上**: 設定ファイルの大幅簡素化
- **拡張性**: 新しいライセンスやテンプレートの追加が容易

## 結論

このガイドラインとi18nベース自動ライセンス表示システムにより、libx-devプロジェクトは以下を実現できます：

### 🎯 **達成される目標**
- **法的コンプライアンス**: ライセンス種別に応じた適切な帰属表記の自動生成
- **開発効率**: 設定ファイルでライセンス名を指定するだけの簡単運用
- **国際化対応**: 15言語での正確で一貫したライセンス表示
- **保守性**: 中央集権的なテンプレート管理による容易なメンテナンス

### 📋 **運用の簡素化**
従来の複雑な設定から、以下のシンプルな設定のみでプロフェッショナルなライセンス表示が可能：

```json
{
  "licensing": {
    "sources": [{"license": "MIT", "author": "作成者名", ...}],
    "showAttribution": true
  }
}
```

### 🌟 **オープンソースへの貢献**

ライセンス遵守は単なる法的義務ではなく、オープンソースコミュニティへの貢献と尊重の表れです。このシステムにより、開発者は技術的詳細を気にせず、適切な法的表記を維持できます。

### 📊 **採用ライセンスの統計**

システムが対応するライセンスは、GitHubにおけるOSSプロジェクトの採用率データに基づいて選定されています：

- **MIT License**: 約55% （最も人気）
- **Apache License 2.0**: 約16%
- **GNU GPL v3.0**: 約13%
- **BSD Licenses**: 約4%
- **ISC License**: 約3%
- **Mozilla Public License 2.0**: 約2%
- **Eclipse Public License**: 約1%
- **その他** (CC0, Zlib, Boost, LPPL, WTFPL等): 約6%

これらの統計により、GitHub上のOSSプロジェクトの約95%以上をカバーしています。

**疑問がある場合は、保守的な判断を行い、必要に応じて法的助言を求めることを推奨します。**
