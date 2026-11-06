import type { Graph, GNode } from '@/domain/graph';
/** Rebuild only when the graph changes, not on selection/highlight updates. */
export function createGraphIndex(graph: Graph) {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const grid = new Map<string, GNode[]>();
  for (const node of graph.nodes) {
    const key = `${Math.floor(node.x / 200)},${Math.floor(node.y / 128)}`;
    const list = grid.get(key) ?? [];
    list.push(node);
    grid.set(key, list);
  }
  return { byId, grid };
}
