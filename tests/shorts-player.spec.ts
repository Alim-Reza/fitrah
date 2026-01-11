import { test, expect } from '@playwright/test';

test.describe('Shorts Player', () => {
  test('should open the exact short that was clicked', async ({ page }) => {
    await page.goto('/');
    
    // Get all shorts cards
    const shortsCards = page.locator('[data-testid^="shorts-card-"]');
    const count = await shortsCards.count();
    
    // Test with the second short (if available)
    if (count >= 2) {
      const secondShort = shortsCards.nth(1);
      const testId = await secondShort.getAttribute('data-testid');
      const expectedVideoId = testId?.replace('shorts-card-', '');
      
      // Click the specific short
      await secondShort.click();
      
      // Verify we're on the correct shorts page
      await expect(page).toHaveURL(`/shorts/${expectedVideoId}`);
      
      // Verify the iframe contains the correct video ID
      const iframe = page.locator('iframe[src*="youtube.com"]').first();
      const src = await iframe.getAttribute('src');
      expect(src).toContain(expectedVideoId);
    }
  });

  test('should have circular navigation for infinite scroll', async ({ page }) => {
    await page.goto('/');
    
    // Click first short
    const firstShort = page.locator('[data-testid^="shorts-card-"]').first();
    await firstShort.click();
    
    // Wait for shorts player to load
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible();
    
    // Get container with scroll
    const container = page.locator('div').filter({ has: page.locator('iframe[src*="youtube.com"]') }).first();
    
    // Scroll down a few times and verify we can keep scrolling
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(500);
    }
    
    // Should still be on a shorts page
    await expect(page).toHaveURL(/\/shorts\/[A-Za-z0-9_-]+/);
  });
});
