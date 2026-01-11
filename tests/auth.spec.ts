import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('should sign up and create account', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to signup tab
    await page.click('button:has-text("Sign Up")');
    
    // Fill in signup form
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', testPassword);
    await page.fill('#confirm-password', testPassword);
    
    // Submit form - use the submit button directly
    await page.click('button[type="submit"]:has-text("Sign Up")');
    
    // Wait for any error or success - increase timeout
    await page.waitForTimeout(2000);
    
    // Check if still on login page (error case) or redirected (success case)
    const url = page.url();
    if (url.includes('/login')) {
      // Take screenshot to debug
      await page.screenshot({ path: 'test-results/signup-debug.png' });
      // Check for error message
      const error = await page.locator('.text-red-500').textContent().catch(() => null);
      console.log('Signup error:', error);
    }
    
    // Should redirect to home after successful signup
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('should login with existing account', async ({ page }) => {
    // First create account
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', testPassword);
    await page.fill('#confirm-password', testPassword);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL('/');
    
    // Sign out
    await page.goto('/profile');
    await page.click('[data-testid="signout-button"]');
    await page.waitForURL('/login');
    
    // Now login - click login tab first
    await page.click('button:has-text("Login")');
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPassword);
    await page.click('button:has-text("Login")');
    
    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('should sign out successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', testPassword);
    await page.fill('#confirm-password', testPassword);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL('/');
    
    // Go to profile and sign out
    await page.goto('/profile');
    await page.click('[data-testid="signout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
