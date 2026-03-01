import { test, expect } from '@playwright/test';

test('capture profile and staking pages', async ({ page }) => {
  // Go to Profile Staking page
  await page.goto('http://localhost:5173/profile/staking');
  
  // Wait for the staking cards to load
  await page.waitForTimeout(1000);
  
  // Take screenshot of the staking page (to verify APY)
  await page.screenshot({ path: 'C:/Users/lenny/.gemini/antigravity/brain/7806a856-6cca-4ce9-8b43-04f137e4a304/staking_apy_fix.png', fullPage: true });

  // Click the avatar to open the modal
  const avatar = page.locator('.rounded-full.bg-slate-900').first();
  await expect(avatar).toBeVisible();
  
  // Hover over the avatar to see edit effect, wait a bit
  await avatar.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/lenny/.gemini/antigravity/brain/7806a856-6cca-4ce9-8b43-04f137e4a304/profile_avatar_hover.png' });

  // Click the avatar
  await avatar.click();
  
  // Wait for the modal to appear
  await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { state: 'visible' });
  await page.screenshot({ path: 'C:/Users/lenny/.gemini/antigravity/brain/7806a856-6cca-4ce9-8b43-04f137e4a304/profile_avatar_modal.png' });
});
