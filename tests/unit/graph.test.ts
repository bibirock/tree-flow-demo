import { describe, expect, it } from 'vitest';
import { generateGraph, collectPath, filterGraph, type Graph } from '@/domain/graph';

describe('可重現的合成資料與固定佈局', () => {
  it('相同輸入產生完全一致的資料與座標', () => {
    expect(generateGraph(100, 'tree')).toEqual(generateGraph(100, 'tree'));
  });
  it('小圖與大圖保留所有唯一節點，連線不指向不存在的節點', () => {
    for (const count of [1, 100, 20000]) {
      const graph = generateGraph(count, 'tree');
      const ids = new Set(graph.nodes.map((n) => n.id));
      expect(ids.size).toBe(count);
      expect(graph.edges).toHaveLength(count - 1);
      expect(graph.edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(true);
    }
  });
  it('樹狀圖所有子節點位於父節點下方', () => {
    const g = generateGraph(500, 'tree');
    for (const e of g.edges)
      expect(g.nodes[Number(e.target)].y).toBeGreaterThan(g.nodes[Number(e.source)].y);
  });
  it('同層節點的方框不重疊', () => {
    const g = generateGraph(500, 'tree');
    const depths = new Set(g.nodes.map((n) => n.depth));
    for (const d of depths) {
      const row = g.nodes.filter((n) => n.depth === d).sort((a, b) => a.x - b.x);
      for (let i = 1; i < row.length; i++)
        expect(row[i].x - row[i - 1].x).toBeGreaterThanOrEqual(150);
    }
  });
  it('網狀圖新增跨支連線，但不改變共用節點座標', () => {
    const a = generateGraph(100, 'tree'),
      b = generateGraph(100, 'network');
    expect(b.edges.length).toBeGreaterThan(a.edges.length);
    expect(b.nodes).toEqual(a.nodes);
  });
  it('來源切換改變標籤而保持資料結構，提供確定性驗收', () => {
    const a = generateGraph(100, 'tree', 1),
      b = generateGraph(100, 'tree', 2);
    expect(a.nodes[0].label).toBe('SOURCE 1');
    expect(b.nodes[0].label).toBe('SOURCE 2');
    expect(a.edges).toEqual(b.edges);
  });
  it('空資料可產生與篩選', () => {
    expect(generateGraph(0, 'tree')).toEqual({ nodes: [], edges: [] });
    expect(filterGraph(generateGraph(0, 'tree'), 8, null)).toEqual({ nodes: [], edges: [] });
  });
});
const fixture: Graph = {
  nodes: ['R', 'A', 'B', 'C', 'D'].map((id, i) => ({
    id,
    label: id,
    depth: i === 0 ? 0 : i < 3 ? 1 : 2,
    x: i * 200,
    y: i * 128,
  })),
  edges: [
    { id: 'RA', source: 'R', target: 'A' },
    { id: 'RB', source: 'R', target: 'B' },
    { id: 'AC', source: 'A', target: 'C' },
    { id: 'BD', source: 'B', target: 'D' },
  ],
};
describe('關聯路徑與篩選的行為基準', () => {
  it('選 A 只包含祖先與後代，不含兄弟分支', () => {
    const p = collectPath(fixture, 'A');
    expect([...p.nodeIds].sort()).toEqual(['A', 'C', 'R']);
    expect([...p.edgeIds].sort()).toEqual(['AC', 'RA']);
  });
  it('換選 B 不留下前一次分支', () => {
    collectPath(fixture, 'A');
    const p = collectPath(fixture, 'B');
    expect([...p.nodeIds].sort()).toEqual(['B', 'D', 'R']);
    expect([...p.edgeIds].sort()).toEqual(['BD', 'RB']);
  });
  it('取消選取清除高亮', () => {
    const p = collectPath(fixture, null);
    expect(p.nodeIds.size).toBe(0);
    expect(p.edgeIds.size).toBe(0);
  });
  it('有循環時走訪會終止且保留關聯邊', () => {
    const g = { ...fixture, edges: [...fixture.edges, { id: 'CA', source: 'C', target: 'A' }] };
    expect([...collectPath(g, 'A').edgeIds].sort()).toEqual(['AC', 'CA', 'RA']);
  });
  it('深度 0 只保留根，不留懸空連線', () => {
    const g = filterGraph(fixture, 0, null);
    expect(g.nodes.map((n) => n.id)).toEqual(['R']);
    expect(g.edges).toHaveLength(0);
  });
  it('聚焦只顯示關聯路徑，且不修改原始圖', () => {
    const before = structuredClone(fixture);
    const g = filterGraph(fixture, 8, collectPath(fixture, 'A').nodeIds);
    expect(g.nodes.map((n) => n.id)).toEqual(['R', 'A', 'C']);
    expect(g.edges.map((e) => e.id)).toEqual(['RA', 'AC']);
    expect(fixture).toEqual(before);
  });
  it('深度與聚焦可以一起套用', () => {
    const g = filterGraph(fixture, 1, collectPath(fixture, 'A').nodeIds);
    expect(g.nodes.map((n) => n.id)).toEqual(['R', 'A']);
    expect(g.edges.map((e) => e.id)).toEqual(['RA']);
  });
});
