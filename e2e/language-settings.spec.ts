import { test, expect } from '@playwright/test';

/**
 * 언어 설정 E2E 테스트
 *
 * 테스트 항목:
 * 1. 한국어 페이지 렌더링 확인
 * 2. 영어 페이지 렌더링 확인
 * 3. 한국어 → 영어 전환 확인
 * 4. 영어 → 한국어 전환 확인
 * 5. URL 변경 확인
 * 6. 선택 카드 자동 변경 확인
 */

test.describe('언어 설정 페이지', () => {

  test('한국어 페이지가 올바르게 렌더링됨', async ({ page }) => {
    // Given: 한국어 설정 페이지 접속
    await page.goto('/ko/settings/language');

    // When: 페이지 로드 완료
    await page.waitForLoadState('networkidle');

    // Then: 한국어 UI가 표시됨
    const heading = await page.locator('main h1').first().textContent();
    expect(heading).toBe('말 바꾸기');

    const subtitle = await page.locator('main h1 + p').textContent();
    expect(subtitle).toBe('Language Settings');

    // And: 한국어 카드가 선택됨
    const koButton = page.locator('button:has-text("한국어")').first();
    const koClass = await koButton.getAttribute('class');
    expect(koClass).toContain('border-purple-500');
    expect(koClass).toContain('bg-purple-50');

    // And: 체크마크 아이콘이 표시됨
    const checkIcon = koButton.locator('.bg-purple-600');
    await expect(checkIcon).toBeVisible();

    // And: 네비게이션도 한국어로 표시됨
    const navItems = await page.locator('nav a span').allTextContents();
    expect(navItems).toContain('목표');
    expect(navItems).toContain('프로젝트');
    expect(navItems).toContain('오늘');
    expect(navItems).toContain('할일');
  });

  test('영어 페이지가 올바르게 렌더링됨', async ({ page }) => {
    // Given: 영어 설정 페이지 접속
    await page.goto('/en/settings/language');

    // When: 페이지 로드 완료
    await page.waitForLoadState('networkidle');

    // Then: 영어 UI가 표시됨
    const heading = await page.locator('main h1').first().textContent();
    expect(heading).toBe('Language Settings');

    const subtitle = await page.locator('main h1 + p').textContent();
    expect(subtitle).toBe('언어 설정');

    // And: English 카드가 선택됨
    const enButton = page.locator('button:has-text("English")').first();
    const enClass = await enButton.getAttribute('class');
    expect(enClass).toContain('border-purple-500');
    expect(enClass).toContain('bg-purple-50');

    // And: 체크마크 아이콘이 표시됨
    const checkIcon = enButton.locator('.bg-purple-600');
    await expect(checkIcon).toBeVisible();

    // And: 네비게이션도 영어로 표시됨
    const navItems = await page.locator('nav a span').allTextContents();
    expect(navItems).toContain('Goals');
    expect(navItems).toContain('Projects');
    expect(navItems).toContain('Today');
    expect(navItems).toContain('To-Do');
  });

  test('한국어 → 영어 언어 전환이 정상 작동함', async ({ page }) => {
    // Given: 한국어 설정 페이지 접속
    await page.goto('/ko/settings/language');
    await page.waitForLoadState('networkidle');

    // When: English 버튼 클릭
    await page.getByRole('button', { name: /English/ }).click();

    // Then: URL이 영어로 변경됨
    await page.waitForURL('**/en/settings/language');
    expect(page.url()).toContain('/en/settings/language');

    // And: 페이지 제목이 영어로 변경됨
    await page.waitForTimeout(1000); // 언어 전환 대기
    const heading = await page.locator('main h1').first().textContent();
    expect(heading).toBe('Language Settings');

    // And: English 카드가 선택됨
    const enButton = page.locator('button:has-text("English")').first();
    const enClass = await enButton.getAttribute('class');
    expect(enClass).toContain('border-purple-500');

    // And: 한국어 카드는 선택 해제됨
    const koButton = page.locator('button:has-text("한국어")').first();
    const koClass = await koButton.getAttribute('class');
    expect(koClass).not.toContain('border-purple-500');

    // And: 네비게이션도 영어로 변경됨
    const navItems = await page.locator('nav a span').allTextContents();
    expect(navItems).toContain('Goals');
    expect(navItems).toContain('Projects');
  });

  test('영어 → 한국어 언어 전환이 정상 작동함', async ({ page }) => {
    // Given: 영어 설정 페이지 접속
    await page.goto('/en/settings/language');
    await page.waitForLoadState('networkidle');

    // When: 한국어 버튼 클릭
    await page.getByRole('button', { name: /한국어/ }).click();

    // Then: URL이 한국어로 변경됨
    await page.waitForURL('**/ko/settings/language');
    expect(page.url()).toContain('/ko/settings/language');

    // And: 페이지 제목이 한국어로 변경됨
    await page.waitForTimeout(1000); // 언어 전환 대기
    const heading = await page.locator('main h1').first().textContent();
    expect(heading).toBe('말 바꾸기');

    // And: 한국어 카드가 선택됨
    const koButton = page.locator('button:has-text("한국어")').first();
    const koClass = await koButton.getAttribute('class');
    expect(koClass).toContain('border-purple-500');

    // And: English 카드는 선택 해제됨
    const enButton = page.locator('button:has-text("English")').first();
    const enClass = await enButton.getAttribute('class');
    expect(enClass).not.toContain('border-purple-500');

    // And: 네비게이션도 한국어로 변경됨
    const navItems = await page.locator('nav a span').allTextContents();
    expect(navItems).toContain('목표');
    expect(navItems).toContain('프로젝트');
  });

  test('선택된 locale에 따라 올바른 카드가 자동 선택됨', async ({ page }) => {
    // Test 1: 한국어 locale → 한국어 카드 선택
    await page.goto('/ko/settings/language');
    await page.waitForLoadState('networkidle');

    let koButton = page.locator('button:has-text("한국어")').first();
    let koHasCheck = await koButton.locator('.bg-purple-600').count() > 0;
    expect(koHasCheck).toBe(true);

    // Test 2: 영어 locale → English 카드 선택
    await page.goto('/en/settings/language');
    await page.waitForLoadState('networkidle');

    const enButton = page.locator('button:has-text("English")').first();
    const enHasCheck = await enButton.locator('.bg-purple-600').count() > 0;
    expect(enHasCheck).toBe(true);

    // Test 3: 다시 한국어로 이동 → 한국어 카드 선택
    await page.goto('/ko/settings/language');
    await page.waitForLoadState('networkidle');

    koButton = page.locator('button:has-text("한국어")').first();
    koHasCheck = await koButton.locator('.bg-purple-600').count() > 0;
    expect(koHasCheck).toBe(true);
  });

  test('HTML lang 속성이 locale과 일치함', async ({ page }) => {
    // Test 1: 한국어 페이지
    await page.goto('/ko/settings/language');
    await page.waitForLoadState('networkidle');

    let htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ko');

    // Test 2: 영어 페이지
    await page.goto('/en/settings/language');
    await page.waitForLoadState('networkidle');

    htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });

  test('네비게이션 링크가 현재 locale을 유지함', async ({ page }) => {
    // Test 1: 한국어 페이지의 네비게이션 링크
    await page.goto('/ko/settings/language');
    await page.waitForLoadState('networkidle');

    const koNavLinks = await page.locator('nav a').evaluateAll(links =>
      links.map(link => link.getAttribute('href'))
    );

    koNavLinks.forEach(href => {
      if (href) {
        expect(href).toMatch(/^\/ko\//);
      }
    });

    // Test 2: 영어 페이지의 네비게이션 링크
    await page.goto('/en/settings/language');
    await page.waitForLoadState('networkidle');

    const enNavLinks = await page.locator('nav a').evaluateAll(links =>
      links.map(link => link.getAttribute('href'))
    );

    enNavLinks.forEach(href => {
      if (href) {
        expect(href).toMatch(/^\/en\//);
      }
    });
  });
});
