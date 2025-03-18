// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: './',
});

// Jestのカスタム設定
const customJestConfig = {
  // テストが置かれるディレクトリのパターンを追加する
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // テスト環境のセットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // モジュールを見つけるためのディレクトリ
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // テスト対象から除外するパターン
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // モジュール名をパスにマッピング
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // テスト環境
  testEnvironment: 'jest-environment-jsdom',
  // カバレッジの設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**/*',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  // カバレッジのレポート出力先
  coverageDirectory: 'coverage',
};

// createJestConfigを使って基本設定を作成
module.exports = createJestConfig(customJestConfig);