import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* 병렬 테스트 실행 */
  fullyParallel: true,

  /* CI 환경에서 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* 병렬 작업 수 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: 'html',

  /* 공통 설정 */
  use: {
    /* 기본 URL */
    baseURL: 'http://localhost:3000',

    /* 스크린샷 및 트레이스 */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* 프로젝트 별 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 개발 서버 자동 시작 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
