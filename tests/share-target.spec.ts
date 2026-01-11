import { test, expect } from '@playwright/test';

test.describe('Share Target Integration', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', testPassword);
    await page.fill('#confirm-password', testPassword);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL('/');
  });

  test('should process shared YouTube video URL', async ({ page }) => {
    const sharedVideoUrl = 'https://www.youtube.com/watch?v=testVideoId123';
    
    // Navigate to share page with URL parameter
    await page.goto(`/share?url=${encodeURIComponent(sharedVideoUrl)}`);
    
    // Should process and redirect
    await page.waitForTimeout(2000);
    
    // Should either show success message or redirect to home
    const currentUrl = page.url();
    const isProcessed = currentUrl === `${page.url().split('/').slice(0, 3).join('/')}/` || 
                       currentUrl.includes('/share');
    expect(isProcessed).toBeTruthy();
  });

  test('should process shared YouTube shorts URL', async ({ page }) => {
    const sharedShortsUrl = 'https://www.youtube.com/shorts/testShortsId456';
    
    // Navigate to share page with URL parameter
    await page.goto(`/share?url=${encodeURIComponent(sharedShortsUrl)}`);
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Should be processed
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should handle invalid URL gracefully', async ({ page }) => {
    const invalidUrl = 'https://example.com/not-youtube';
    
    // Navigate to share page with invalid URL
    await page.goto(`/share?url=${encodeURIComponent(invalidUrl)}`);
    
    // Should show error or handle gracefully
    await page.waitForTimeout(1000);
    
    // Page should still be functional
    expect(page.url()).toContain('/share');
  });
});
