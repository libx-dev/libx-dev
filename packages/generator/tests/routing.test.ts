/**
 * ルーティング生成のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { loadRegistry } from '../src/registry.js';
import {
  generateRoutes,
  getRoutesStats,
  routeToUrl,
  dumpRoutes,
} from '../src/routing.js';

describe('generateRoutes', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);

  it('production環境でpublicドキュメントのみ生成される', () => {
    const routes = generateRoutes(registry, { env: 'production' });

    expect(routes.length).toBeGreaterThan(0);

    // 全てのルートがpublicであることを確認
    routes.forEach((route) => {
      expect(route.props.visibility).toBe('public');
    });
  });

  it('development環境で全ドキュメントが生成される', () => {
    const routes = generateRoutes(registry, { env: 'development' });

    expect(routes.length).toBeGreaterThan(0);

    // publicドキュメントは必ず含まれる
    const publicRoutes = routes.filter((r) => r.props.visibility === 'public');
    expect(publicRoutes.length).toBeGreaterThan(0);
  });

  it('特定のプロジェクトのみ生成できる', () => {
    const routes = generateRoutes(registry, {
      env: 'development',
      projectId: 'test-verification',
    });

    expect(routes.length).toBeGreaterThan(0);

    // 全てのルートが指定プロジェクトであることを確認
    routes.forEach((route) => {
      expect(route.params.project).toBe('test-verification');
    });
  });

  it('特定のバージョンのみ生成できる', () => {
    const routes = generateRoutes(registry, {
      env: 'development',
      version: 'v2',
    });

    expect(routes.length).toBeGreaterThan(0);

    // 全てのルートが指定バージョンであることを確認
    routes.forEach((route) => {
      expect(route.params.version).toBe('v2');
    });
  });

  it('特定の言語のみ生成できる', () => {
    const routes = generateRoutes(registry, {
      env: 'development',
      lang: 'ja',
    });

    expect(routes.length).toBeGreaterThan(0);

    // 全てのルートが指定言語であることを確認
    routes.forEach((route) => {
      expect(route.params.lang).toBe('ja');
    });
  });

  it('生成されたルートが正しい構造を持つ', () => {
    const routes = generateRoutes(registry, {
      env: 'development',
      projectId: 'test-verification',
    });

    expect(routes.length).toBeGreaterThan(0);

    const route = routes[0];

    // paramsの検証
    expect(route.params).toBeDefined();
    expect(route.params.project).toBeDefined();
    expect(route.params.version).toBeDefined();
    expect(route.params.lang).toBeDefined();
    expect(route.params.slug).toBeDefined();

    // propsの検証
    expect(route.props).toBeDefined();
    expect(route.props.docId).toBeDefined();
    expect(route.props.projectId).toBeDefined();
    expect(route.props.title).toBeDefined();
    expect(route.props.summary).toBeDefined();
    expect(route.props.contentPath).toBeDefined();
    expect(route.props.visibility).toBeDefined();
    expect(route.props.status).toBeDefined();
  });

  it('publishedステータスのコンテンツのみ生成される', () => {
    const routes = generateRoutes(registry, { env: 'development' });

    routes.forEach((route) => {
      // contentPathが存在する = publishedステータス
      expect(route.props.contentPath).toBeDefined();
      expect(route.props.contentPath.length).toBeGreaterThan(0);
    });
  });

  it('デバッグモードでログが出力される', () => {
    // デバッグモードのテスト（コンソール出力の確認は省略）
    const routes = generateRoutes(registry, {
      env: 'development',
      debug: true,
    });

    expect(routes.length).toBeGreaterThan(0);
  });
});

describe('getRoutesStats', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);
  const routes = generateRoutes(registry, { env: 'development' });

  it('統計情報を取得できる', () => {
    const stats = getRoutesStats(routes);

    expect(stats.totalRoutes).toBe(routes.length);
    expect(stats.byProject).toBeDefined();
    expect(stats.byVersion).toBeDefined();
    expect(stats.byLanguage).toBeDefined();
    expect(stats.byVisibility).toBeDefined();
  });

  it('プロジェクト別の集計が正確', () => {
    const stats = getRoutesStats(routes);
    const projectCounts = Object.values(stats.byProject);
    const totalFromProjects = projectCounts.reduce((sum, count) => sum + count, 0);

    expect(totalFromProjects).toBe(routes.length);
  });

  it('言語別の集計が正確', () => {
    const stats = getRoutesStats(routes);
    const langCounts = Object.values(stats.byLanguage);
    const totalFromLangs = langCounts.reduce((sum, count) => sum + count, 0);

    expect(totalFromLangs).toBe(routes.length);
  });
});

describe('routeToUrl', () => {
  it('ルートからURLを生成できる', () => {
    const route = {
      params: {
        project: 'test-verification',
        version: 'v2',
        lang: 'ja',
        slug: 'guide/getting-started',
      },
      props: {} as any,
    };

    const url = routeToUrl(route);
    expect(url).toBe('/test-verification/v2/ja/guide/getting-started');
  });

  it('ベースURLを指定できる', () => {
    const route = {
      params: {
        project: 'test-verification',
        version: 'v2',
        lang: 'ja',
        slug: 'guide/getting-started',
      },
      props: {} as any,
    };

    const url = routeToUrl(route, '/docs');
    expect(url).toBe('/docs/test-verification/v2/ja/guide/getting-started');
  });

  it('連続するスラッシュが正規化される', () => {
    const route = {
      params: {
        project: 'test-verification',
        version: 'v2',
        lang: 'ja',
        slug: 'guide/getting-started',
      },
      props: {} as any,
    };

    const url = routeToUrl(route, '/docs/');
    expect(url).not.toContain('//');
  });
});

describe('dumpRoutes', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);
  const routes = generateRoutes(registry, { env: 'development' });

  it('ルート情報をダンプできる（エラーが発生しない）', () => {
    // コンソール出力のテストは省略
    expect(() => {
      dumpRoutes(routes, 5);
    }).not.toThrow();
  });

  it('空の配列でもエラーが発生しない', () => {
    expect(() => {
      dumpRoutes([], 5);
    }).not.toThrow();
  });
});

describe('generateRoutes - スナップショット', () => {
  const basePath = resolve(process.cwd(), '../..');
  const registry = loadRegistry('registry/docs.json', basePath);

  it('production環境のルート生成結果がスナップショットと一致', () => {
    const routes = generateRoutes(registry, {
      env: 'production',
      projectId: 'test-verification',
      version: 'v2',
      lang: 'ja',
    });

    // 最初の3ルートのみスナップショット（全体は多すぎるため）
    const snapshot = routes.slice(0, 3).map((route) => ({
      url: routeToUrl(route),
      docId: route.props.docId,
      visibility: route.props.visibility,
    }));

    expect(snapshot).toMatchSnapshot();
  });

  it('development環境のルート生成結果がスナップショットと一致', () => {
    const routes = generateRoutes(registry, {
      env: 'development',
      projectId: 'test-verification',
      version: 'v2',
      lang: 'en',
    });

    const snapshot = routes.slice(0, 3).map((route) => ({
      url: routeToUrl(route),
      docId: route.props.docId,
      visibility: route.props.visibility,
    }));

    expect(snapshot).toMatchSnapshot();
  });
});
