export type View = 'tree' | 'network';
export type GNode = { id: string; label: string; depth: number; x: number; y: number };
export type GEdge = { id: string; source: string; target: string };
export type Graph = { nodes: GNode[]; edges: GEdge[] };
export const W = 150,
  H = 44;
// Deterministic synthetic data. Both renderers receive these exact positions.
export function generateGraph(count: number, view: View, seed = 1): Graph {
  const nodes: GNode[] = [],
    edges: GEdge[] = [];
  const breadth = 5;
  for (let i = 0; i < count; i++) {
    const depth = i === 0 ? 0 : nodes[Math.floor((i - 1) / breadth)].depth + 1;
    const id = String(i);
    nodes.push({
      id,
      label: i === 0 ? `SOURCE ${seed}` : `MODULE ${String(i).padStart(4, '0')}`,
      depth,
      x: 0,
      y: depth * 128,
    });
    if (i) edges.push({ id: `e-${i}`, source: String(Math.floor((i - 1) / breadth)), target: id });
    if (view === 'network' && i > 8 && i % 7 === 0) {
      const other = Math.max(0, Math.floor((i - 1) / breadth) - 1);
      edges.push({ id: `cross-${i}`, source: String(other), target: id });
    }
  }
  // Iterative postorder leaf-packing: partial final levels must not overlap ancestors.
  let cursor = 0;
  const stack: Array<[number, boolean]> = count ? [[0, false]] : [];
  while (stack.length) {
    const [i, exiting] = stack.pop()!;
    const first = i * breadth + 1,
      last = Math.min(count - 1, first + breadth - 1);
    if (!exiting && first < count) {
      stack.push([i, true]);
      for (let child = last; child >= first; child--) stack.push([child, false]);
    } else {
      nodes[i].x = first < count ? (nodes[first].x + nodes[last].x) / 2 : cursor++ * (W + 34);
    }
  }
  return { nodes, edges };
}
export function collectPath(graph: Graph, selected: string | null) {
  const nodeIds = new Set<string>(),
    edgeIds = new Set<string>();
  if (!selected) return { nodeIds, edgeIds };
  nodeIds.add(selected);
  const incoming = new Map<string, GEdge[]>(),
    outgoing = new Map<string, GEdge[]>();
  for (const e of graph.edges) {
    const ins = incoming.get(e.target) ?? [];
    ins.push(e);
    incoming.set(e.target, ins);
    const outs = outgoing.get(e.source) ?? [];
    outs.push(e);
    outgoing.set(e.source, outs);
  }
  for (const [map, key] of [
    [incoming, 'source'],
    [outgoing, 'target'],
  ] as const) {
    const seen = new Set([selected]),
      queue = [selected];
    for (let i = 0; i < queue.length; i++)
      for (const e of map.get(queue[i]) ?? []) {
        edgeIds.add(e.id);
        const id = e[key];
        nodeIds.add(id);
        if (!seen.has(id)) {
          seen.add(id);
          queue.push(id);
        }
      }
  }
  return { nodeIds, edgeIds };
}
export function filterGraph(graph: Graph, depth: number, focus: Set<string> | null): Graph {
  const nodes = graph.nodes.filter((n) => n.depth <= depth && (!focus || focus.has(n.id)));
  const ids = new Set(nodes.map((n) => n.id));
  return { nodes, edges: graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
}
