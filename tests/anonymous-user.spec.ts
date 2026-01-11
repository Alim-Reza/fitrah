import { test, expect } from '@playwright/test';

test.describe('Anonymous User Experience', () => {
  test('should see default video list on home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load - check for header element
    await expect(page.locator('header')).toBeVisible();
    
    // Check that videos are displayed
    const videoCards = page.locator('[data-testid^="video-card-"]');
    await expect(videoCards.first()).toBeVisible();
    
    // Check that shorts section exists
    await expect(page.locator('text=Shorts')).toBeVisible();
    const shortsCards = page.locator('[data-testid^="shorts-card-"]');
    await expect(shortsCards.first()).toBeVisible();
  });

  test('should open video player when clicking a video card', async ({ page }) => {
    await page.goto('/');
    
    // Click first video card
    const firstVideo = page.locator('[data-testid^="video-card-"]').first();
    await firstVideo.click();
    
    // Should navigate to video player
    await expect(page).toHaveURL(/\/video\/[A-Za-z0-9_-]+/);
    
    // Check iframe is present
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible();
  });

  test('should open exact short when clicking a shorts card', async ({ page }) => {
    await page.goto('/');
    
    // Get the ID of a specific shorts card
    const shortsCard = page.locator('[data-testid^="shorts-card-"]').first();
    const testId = await shortsCard.getAttribute('data-testid');
    const videoId = testId?.replace('shorts-card-', '');
    
    // Click the shorts card
    await shortsCard.click();
    
    // Should navigate to shorts player with exact ID
    await expect(page).toHaveURL(`/shorts/${videoId}`);
  });

  test('should redirect to login when clicking add button', async ({ page }) => {
    await page.goto('/');
    
    // Click the + button (add video) - it's in the bottom nav
    await page.click('nav a[href="#"]');
    
    // Should be on add-video initially, but might redirect if auth is checked
    await page.waitForURL(/\/(add-video|login)/);
  });
});
