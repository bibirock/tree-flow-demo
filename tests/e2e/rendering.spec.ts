import { test, expect, type Page } from '@playwright/test';
import { generateGraph, W, H } from '@/domain/graph';
async function open(page: Page, renderer = 'canvas') {
  await page.goto('/');
  await page.getByLabel('資料規模', { exact: true }).selectOption('100');
  await page.getByTestId(`renderer-${renderer}`).click();
  await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
  await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
}
function errors(page: Page) {
  const list: string[] = [];
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') list.push(m.text());
  });
  return list;
}
for (const renderer of ['reactflow', 'canvas']) {
  test.describe(`${renderer} 共用行為基準`, () => {
    test('載入、選取、高亮、聚焦與清除維持相同結果', async ({ page }) => {
      const list = errors(page);
      await open(page, renderer);
      await page.getByLabel('選取節點', { exact: true }).selectOption('1');
      await expect(page.getByTestId('selection-summary')).toContainText('MODULE 0001');
      await expect(page.getByTestId('selection-summary')).toContainText('32 個關聯節點');
      await page.getByRole('button', { name: '只看關聯路徑' }).click();
      await expect(page.getByTestId('visible-count')).toHaveText('32/ 100');
      await page.getByRole('button', { name: '清除選取' }).click();
      await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
      expect(list).toEqual([]);
    });
    test('深度限制與恢復，不留懸空連線', async ({ page }) => {
      await open(page, renderer);
      const slider = page.getByRole('slider', { name: '顯示深度' });
      await slider.fill('0');
      await expect(page.getByTestId('visible-count')).toHaveText('1/ 100');
      await expect(page.getByTestId('edge-count')).toHaveText('0 條關聯連線');
      await slider.fill('8');
      await expect(page.getByTestId('visible-count')).toHaveText('100/ 100');
    });
    test('樹狀與網狀往返三次，結果可重現', async ({ page }) => {
      const list = errors(page);
      await open(page, renderer);
      for (let i = 0; i < 3; i++) {
        await page
          .getByLabel('圖形視圖', { exact: true })
          .selectOption(i % 2 === 0 ? 'network' : 'tree');
        await page.getByRole('button', { name: '載入並量測' }).click();
        await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
        await expect(page.getByTestId('edge-count')).toHaveText(
          i % 2 === 0 ? '112 條關聯連線' : '99 條關聯連線',
        );
      }
      expect(list).toEqual([]);
    });
    test('切換來源後更新標籤並清除舊選取', async ({ page }) => {
      await open(page, renderer);
      await page.getByLabel('選取節點', { exact: true }).selectOption('1');
      await page.getByLabel('資料來源', { exact: true }).selectOption('2');
      await page.getByRole('button', { name: '載入並量測' }).click();
      await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
      await expect(page.getByLabel('選取節點', { exact: true })).toHaveValue('');
      await expect(
        page.getByLabel('選取節點', { exact: true }).getByRole('option', { name: 'SOURCE 2' }),
      ).toHaveCount(1);
    });
  });
}
test('Canvas 確實繪圖、可由畫布命中節點，縮放會改變畫面', async ({ page }) => {
  const list = errors(page);
  await open(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const before = await canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL());
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('missing canvas');
  const g = generateGraph(100, 'tree');
  const minX = Math.min(...g.nodes.map((n) => n.x)),
    maxX = Math.max(...g.nodes.map((n) => n.x + W)),
    maxY = Math.max(...g.nodes.map((n) => n.y + H));
  const s = Math.min(1.2, (rect.width - 100) / (maxX - minX), (rect.height - 100) / maxY);
  const vx = (rect.width - (maxX + minX) * s) / 2,
    vy = (rect.height - maxY * s) / 2;
  await canvas.click({ position: { x: vx + (g.nodes[0].x + W / 2) * s, y: vy + (H / 2) * s } });
  await expect(page.getByTestId('selection-summary')).toContainText('SOURCE 1');
  await page.getByRole('button', { name: '放大', exact: true }).click();
  await expect
    .poll(() => canvas.evaluate((c) => (c as HTMLCanvasElement).toDataURL()))
    .not.toBe(before);
  expect(list).toEqual([]);
});
test('依序比較兩版，顯示真實量測且沒有匯出功能', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: '依序比較兩版' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '匯出 JSON' })).toHaveCount(0);
  const values = await page.locator('tbody .emphasis').allTextContents();
  expect(values.every((value) => parseFloat(value) > 0)).toBe(true);
});
test('Canvas 大量節點可呈現，完成後仍可互動', async ({ page }) => {
  const list = errors(page);
  await open(page);
  await page.getByLabel('資料規模', { exact: true }).selectOption('20000');
  await page.getByRole('button', { name: '載入並量測' }).click();
  await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled();
  await expect(page.getByTestId('visible-count')).toHaveText('20,000/ 20,000');
  await page.getByLabel('選取節點', { exact: true }).selectOption('1');
  await expect(page.getByTestId('selection-summary')).toContainText('MODULE 0001');
  expect(list).toEqual([]);
});
test('手機版設定與圖形仍可操作，沒有水平溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('canvas')).toBeVisible();
});

test('React Flow 點選與聚焦保留當下縮放和平移', async ({ page }) => {
  await open(page, 'reactflow');
  await page.getByRole('button', { name: '放大', exact: true }).click();
  const viewport = page.locator('.react-flow__viewport');
  const before = await viewport.getAttribute('style');
  await page.getByLabel('選取節點', { exact: true }).selectOption('1');
  await expect(viewport).toHaveAttribute('style', before!);
  await page.getByRole('button', { name: '只看關聯路徑' }).click();
  await expect(viewport).toHaveAttribute('style', before!);
});

test('Canvas 放大平移後連續點同一節點，不自動退回全圖', async ({ page }) => {
  await open(page);
  const canvas = page.locator('canvas'),
    rect = await canvas.boundingBox();
  if (!rect) throw new Error('missing canvas');
  const g = generateGraph(100, 'tree');
  const minX = Math.min(...g.nodes.map((n) => n.x)),
    maxX = Math.max(...g.nodes.map((n) => n.x + W)),
    maxY = Math.max(...g.nodes.map((n) => n.y + H));
  const initialScale = Math.min(
    1.2,
    (rect.width - 100) / (maxX - minX),
    (rect.height - 100) / maxY,
  );
  let x = (rect.width - (maxX + minX) * initialScale) / 2 + (g.nodes[0].x + W / 2) * initialScale;
  let y = (rect.height - maxY * initialScale) / 2 + (H / 2) * initialScale;
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '放大', exact: true }).click();
    x = rect.width / 2 + (x - rect.width / 2) * 1.4;
    y = rect.height / 2 + (y - rect.height / 2) * 1.4;
  }
  const currentRect = await canvas.boundingBox();
  if (!currentRect) throw new Error('missing canvas after zoom');
  await page.mouse.move(currentRect.x + 20, currentRect.y + 20);
  await page.mouse.down();
  await page.mouse.move(currentRect.x + 80, currentRect.y + 55, { steps: 6 });
  await page.mouse.up();
  x += 60;
  y += 35;
  await canvas.click({ position: { x, y } });
  await expect(page.getByTestId('selection-summary')).toContainText('SOURCE 1');
  await page.getByRole('button', { name: '只看關聯路徑' }).click();
  await canvas.click({ position: { x, y } });
  await expect(page.getByTestId('selection-summary')).toContainText('SOURCE 1');
  await page.screenshot({ path: 'test-results/viewport-preserved.png', fullPage: true });
});

test('預設一萬節點、最小 UI 字級 14px，沒有側邊欄或宣傳文案', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('資料規模', { exact: true })).toHaveValue('10000');
  await expect(page.getByTestId('visible-count')).toHaveText('10,000/ 10,000');
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.getByText('把等待，變成即時探索')).toHaveCount(0);
  const smallFonts = await page
    .locator(
      'main button, main label, main small, main p, main select, .metrics > article > span, .canvas-top span, .selection-summary',
    )
    .evaluateAll((elements) =>
      elements
        .filter(
          (el) =>
            el.getBoundingClientRect().width > 0 &&
            Number.parseFloat(getComputedStyle(el).fontSize) < 14,
        )
        .map((el) => ({ text: el.textContent, font: getComputedStyle(el).fontSize })),
    );
  expect(smallFonts).toEqual([]);
});

test('React Flow 的邊框與連線在縮放後維持 Canvas 的螢幕粗細', async ({ page }) => {
  await open(page, 'reactflow');
  const check = async () =>
    page.locator('.react-flow').evaluate((el) => {
      const transform = getComputedStyle(el.querySelector('.react-flow__viewport')!).transform;
      const zoom = new DOMMatrix(transform).a;
      const rect = el.querySelector('.node-shape rect')!,
        path = el.querySelector('.react-flow__edge-path')!;
      return {
        nodeStroke: parseFloat(getComputedStyle(rect).strokeWidth) * zoom,
        edgeStroke: parseFloat(getComputedStyle(path).strokeWidth) * zoom,
      };
    });
  const widths = await check();
  expect(widths.nodeStroke).toBeCloseTo(1, 2);
  expect(widths.edgeStroke).toBeCloseTo(1, 2);
  await page.getByRole('button', { name: '放大', exact: true }).click();
  await expect.poll(async () => (await check()).nodeStroke).toBeCloseTo(1, 2);
});

test('切換先更新頁籤並畫出 loading，之後才掛載 React Flow', async ({ page }) => {
  await page.addInitScript(() => {
    const evidence = window as unknown as { loadingPaintBeforeRenderer?: boolean };
    const observer = new MutationObserver(() => {
      if (
        document.querySelector('[data-testid="renderer-reactflow"][aria-pressed="true"]') &&
        document.querySelector('[data-testid="render-loading"]')
      ) {
        requestAnimationFrame(() => {
          if (
            document.querySelector('[data-testid="render-loading"]') &&
            !document.querySelector('.react-flow')
          )
            evidence.loadingPaintBeforeRenderer = true;
        });
      }
    });
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed'],
    });
  });
  await page.goto('/');
  await page.getByTestId('renderer-reactflow').click();
  await expect(page.getByTestId('renderer-reactflow')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '載入並量測' })).toBeEnabled({ timeout: 30000 });
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { loadingPaintBeforeRenderer?: boolean }).loadingPaintBeforeRenderer,
    ),
  ).toBe(true);
  await expect(page.getByTestId('render-loading')).toHaveCount(0);
  await expect(page.getByTestId('visible-count')).toHaveText('10,000/ 10,000');
});
