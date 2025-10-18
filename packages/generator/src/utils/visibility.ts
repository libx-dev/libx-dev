/**
 * Visibility制御ユーティリティ
 *
 * ドキュメントのvisibility設定と環境変数に基づいて、
 * ページをビルドするかどうかを判定します。
 */

import type { VisibilityCheckResult } from '../types.js';

/**
 * ページをビルドすべきかどうかを判定
 *
 * @param visibility - ドキュメントのvisibility設定（public, internal, draft）
 * @param env - ビルド環境（production, staging, development, preview）
 * @returns ビルドすべきかどうかと、その理由
 *
 * @example
 * ```ts
 * const result = shouldBuildPage('draft', 'production');
 * console.log(result.shouldBuild); // false
 * console.log(result.reason); // "draft document excluded in production"
 * ```
 */
export function shouldBuildPage(
  visibility: string,
  env?: string
): VisibilityCheckResult {
  const normalizedEnv = (env || process.env.NODE_ENV || 'development').toLowerCase();
  const normalizedVisibility = visibility.toLowerCase();

  switch (normalizedVisibility) {
    case 'public':
      // publicは全環境でビルド
      return {
        shouldBuild: true,
        reason: 'public document always built',
      };

    case 'draft':
      // draftは開発環境とプレビュー環境のみ
      if (normalizedEnv === 'development' || normalizedEnv === 'preview') {
        return {
          shouldBuild: true,
          reason: `draft document included in ${normalizedEnv}`,
        };
      }
      return {
        shouldBuild: false,
        reason: `draft document excluded in ${normalizedEnv}`,
      };

    case 'internal':
      // internalは本番環境以外
      if (normalizedEnv === 'production') {
        return {
          shouldBuild: false,
          reason: 'internal document excluded in production',
        };
      }
      return {
        shouldBuild: true,
        reason: `internal document included in ${normalizedEnv}`,
      };

    default:
      // 不明なvisibilityは安全のため除外
      return {
        shouldBuild: false,
        reason: `unknown visibility type: ${visibility}`,
      };
  }
}

/**
 * 複数のドキュメントをフィルタリング
 *
 * @param documents - ドキュメントの配列
 * @param env - ビルド環境
 * @returns ビルドすべきドキュメントのみを含む配列
 */
export function filterDocumentsByVisibility<T extends { visibility: string }>(
  documents: T[],
  env?: string
): T[] {
  return documents.filter((doc) => {
    const result = shouldBuildPage(doc.visibility, env);
    return result.shouldBuild;
  });
}

/**
 * Visibility設定の検証
 *
 * @param visibility - 検証するvisibility値
 * @returns 有効なvisibility値かどうか
 */
export function isValidVisibility(visibility: string): boolean {
  const validValues = ['public', 'internal', 'draft'];
  return validValues.includes(visibility.toLowerCase());
}

/**
 * 環境変数の検証
 *
 * @param env - 検証する環境値
 * @returns 有効な環境値かどうか
 */
export function isValidEnvironment(env: string): boolean {
  const validEnvironments = ['production', 'staging', 'development', 'preview'];
  return validEnvironments.includes(env.toLowerCase());
}
