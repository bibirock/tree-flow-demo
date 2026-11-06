import { test, expect } from '@playwright/test';
for (const [label] of [['模擬元件渲染錯誤'], ['模擬非同步繪製錯誤']]) {
  test(`${label}：自動回退且保留資料與操作`, async ({ page }) => {
    await page.goto('/fallback-test');
    await expect(page.getByRole('heading', { name: '錯誤回退測試' })).toBeVisible();
    await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByTestId('fallback-notice')).toContainText('已自動切換至 React Flow');
    await expect(page.getByTestId('renderer-reactflow')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
    await page.getByLabel('選取節點', { exact: true }).selectOption('1');
    await expect(page.getByTestId('selection-summary')).toContainText('32 個關聯節點');
    // A successful fallback records one result, not a retry loop.
    await expect(page.locator('tbody tr')).toHaveCount(0);
    await expect(page.getByText('目前渲染器', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: '正常載入 Canvas' }).click();
    await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
    await expect(page.getByTestId('renderer-canvas')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('fallback-notice')).toHaveCount(0);
  });
}
