# E2E 테스트 가이드

Playwright를 사용한 End-to-End 테스트입니다.

## 📦 설치

```bash
npm install
npx playwright install chromium
```

## 🧪 테스트 실행

### 기본 실행 (헤드리스 모드)
```bash
npm run test:e2e
```

### UI 모드로 실행 (개발 중 권장)
```bash
npm run test:e2e:ui
```

### 브라우저를 표시하며 실행
```bash
npm run test:e2e:headed
```

### 특정 테스트만 실행
```bash
npx playwright test language-settings.spec.ts
```

### 특정 테스트 케이스만 실행
```bash
npx playwright test -g "한국어 페이지가 올바르게 렌더링됨"
```

## 📊 테스트 리포트

테스트 실행 후 HTML 리포트를 확인할 수 있습니다:

```bash
npm run test:e2e:report
```

## 🎯 테스트 항목

### language-settings.spec.ts

언어 설정 페이지의 다국어 기능을 테스트합니다:

1. **한국어 페이지 렌더링**
   - 제목, 부제목이 한국어로 표시
   - 한국어 카드가 선택됨
   - 네비게이션이 한국어로 표시

2. **영어 페이지 렌더링**
   - 제목, 부제목이 영어로 표시
   - English 카드가 선택됨
   - 네비게이션이 영어로 표시

3. **언어 전환**
   - 한국어 → 영어 전환 확인
   - 영어 → 한국어 전환 확인
   - URL 변경 확인
   - 선택 카드 자동 변경 확인

4. **Locale 일관성**
   - HTML lang 속성이 locale과 일치
   - 네비게이션 링크가 현재 locale 유지

## 🔧 설정

`playwright.config.ts`에서 설정을 변경할 수 있습니다:

- **baseURL**: 테스트 대상 URL (기본값: `http://localhost:3000`)
- **webServer**: 개발 서버 자동 시작 설정
- **retries**: 테스트 재시도 횟수 (CI: 2회, 로컬: 0회)
- **workers**: 병렬 실행 워커 수

## 📝 테스트 작성 가이드

### 테스트 구조
```typescript
test.describe('테스트 그룹명', () => {
  test('테스트 케이스명', async ({ page }) => {
    // Given: 초기 상태 설정
    await page.goto('/ko/settings/language');

    // When: 액션 수행
    await page.getByRole('button', { name: /English/ }).click();

    // Then: 결과 검증
    expect(page.url()).toContain('/en/settings/language');
  });
});
```

### 유용한 Playwright API

#### 페이지 탐색
```typescript
await page.goto('/path');
await page.waitForLoadState('networkidle');
await page.waitForURL('**/en/settings/language');
```

#### 요소 선택
```typescript
page.locator('selector');
page.getByRole('button', { name: /text/ });
page.getByText('text');
```

#### 검증
```typescript
expect(element).toBeVisible();
expect(element).toHaveText('text');
expect(element).toHaveAttribute('class', 'value');
```

## 🐛 디버깅

### 실행 중 브라우저 보기
```bash
npm run test:e2e:headed
```

### 디버그 모드
```bash
npx playwright test --debug
```

### 스크린샷 확인
테스트 실패 시 자동으로 스크린샷이 생성됩니다:
```
test-results/
└── language-settings-spec-ts-...
    └── test-failed-1.png
```

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Test 가이드](https://playwright.dev/docs/test-assertions)
- [Next.js 테스팅 문서](https://nextjs.org/docs/testing)

## 🚀 CI/CD 통합

GitHub Actions 예시:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```
