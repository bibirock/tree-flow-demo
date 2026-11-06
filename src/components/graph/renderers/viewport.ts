import { W, H, type Graph } from '@/domain/graph';
import { designTokens } from '@/design/tokens';
export type GraphViewport = { x: number; y: number; scale: number };
export function fitGraphViewport(graph: Graph, width: number, height: number): GraphViewport {
  if (!graph.nodes.length) return { x: 0, y: 0, scale: 1 };
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const node of graph.nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + W);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y + H);
  }
  const padding = designTokens.graph.fitPadding;
  const scale = Math.max(
    designTokens.graph.minZoom,
    Math.min(
      designTokens.graph.fitMaxZoom,
      (width - padding * 2) / (maxX - minX),
      (height - padding * 2) / (maxY - minY),
    ),
  );
  return { scale, x: (width - (maxX + minX) * scale) / 2, y: (height - (maxY + minY) * scale) / 2 };
}
export function initialGraphViewport(graph: Graph, width: number, height: number): GraphViewport {
  return fitGraphViewport(graph, width, height);
}
