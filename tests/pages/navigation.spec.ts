import { test, expect } from '@playwright/test';
test('Pages 子目錄資源、導覽、重新整理與錯誤回退', async ({ page }) => {
  const failedAssets: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400 && /\.(js|css)(\?|$)/.test(response.url())) {
      failedAssets.push(response.url());
    }
  });
  await page.goto('./');
  await expect(page.getByLabel('資料規模', { exact: true })).toHaveValue('10000');
  const nav = page.getByRole('navigation', { name: '頁面導覽' });
  await nav.getByRole('link', { name: '錯誤回退測試', exact: true }).click();
  await expect(page).toHaveURL(/\/tree-flow-demo\/#\/fallback-test$/);
  await page.reload();
  await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
  await page.getByRole('button', { name: '模擬非同步繪製錯誤', exact: true }).click();
  await expect(page.getByTestId('fallback-notice')).toContainText('已自動切換至 React Flow');
  await expect(page.getByTestId('renderer-reactflow')).toHaveAttribute('aria-pressed', 'true');
  await nav.getByRole('link', { name: '圖形渲染比較', exact: true }).click();
  await expect(page.locator('.metrics')).toHaveCount(1);
  expect(failedAssets).toEqual([]);
});
