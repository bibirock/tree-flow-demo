import { expect, it } from 'vitest';
import { generateGraph } from '@/domain/graph';
import { fitGraphViewport, initialGraphViewport } from '@/components/graph/renderers/viewport';
it('小圖初始使用全圖適應', () => {
  const g = generateGraph(100, 'tree');
  expect(initialGraphViewport(g, 1000, 600)).toEqual(fitGraphViewport(g, 1000, 600));
});
it('一萬節點仍採用共用的全圖適應，不改變使用者設定', () => {
  const graph = generateGraph(10000, 'tree');
  expect(initialGraphViewport(graph, 1000, 600)).toEqual(fitGraphViewport(graph, 1000, 600));
  expect(graph.nodes.length).toBe(10000);
});
