import { test, expect } from '@playwright/test';

test.describe('Add Video Feature', () => {
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

  test('should add a video from YouTube URL', async ({ page }) => {
    await page.goto('/add-video');
    
    // Fill in video URL
    const testVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    await page.fill('input[type="url"]', testVideoUrl);
    
    // Select video type
    await page.check('input[value="video"]');
    
    // Submit
    await page.click('button:has-text("Add Video")');
    
    // Should redirect to home and show success
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Video should appear in list
    await expect(page.locator('[data-testid="video-card-dQw4w9WgXcQ"]')).toBeVisible();
  });

  test('should add a shorts from YouTube shorts URL', async ({ page }) => {
    await page.goto('/add-video');
    
    // Fill in shorts URL
    const testShortsUrl = 'https://www.youtube.com/shorts/abc123xyz';
    await page.fill('input[type="url"]', testShortsUrl);
    
    // Select shorts type
    await page.check('input[value="shorts"]');
    
    // Submit
    await page.click('button:has-text("Add Video")');
    
    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Shorts should appear in list
    await expect(page.locator('[data-testid="shorts-card-abc123xyz"]')).toBeVisible();
  });
});
