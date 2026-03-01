import { test, expect } from '@playwright/test';

test('verify whitepaper pdf download link', async ({ page }) => {
  await page.goto('http://localhost:5173/whitepaper');
  
  // Find the "Download Full PDF" button
  const downloadButton = page.getByRole('link', { name: /Download Full PDF/i });
  await expect(downloadButton).toBeVisible();
  
  // Check the href attribute
  const href = await downloadButton.getAttribute('href');
  expect(href).toBe('/docs/Nuxchain_Whitepaper.pdf');
  
  // Check the download attribute
  const downloadAttr = await downloadButton.getAttribute('download');
  expect(downloadAttr).toBe('nuxchain-whitepaper.pdf');
  
  // Take a screenshot
  await page.screenshot({ path: 'C:/Users/lenny/.gemini/antigravity/brain/7806a856-6cca-4ce9-8b43-04f137e4a304/whitepaper_download_verify.png' });
  
  // Optional: Check if the PDF is accessible (HEAD request)
  const response = await page.request.head('http://localhost:5173/docs/Nuxchain_Whitepaper.pdf');
  expect(response.status()).toBe(200);
});
