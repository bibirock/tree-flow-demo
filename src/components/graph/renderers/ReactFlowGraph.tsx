import { initialGraphViewport } from '@/components/graph/renderers/viewport';
import { designTokens } from '@/design/tokens';
import { memo, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  useReactFlow,
  useViewport,
  useStore,
  type NodeProps,
} from '@xyflow/react';
import { W, H, type Graph } from '@/domain/graph';
const GraphNode = memo(function GraphNode({ data, selected }: NodeProps) {
  const related = Boolean(data.related);
  return (
    <div className={`flow-node ${related ? 'related' : ''} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <svg className="node-shape" width={W} height={H} aria-hidden="true">
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          rx={designTokens.graph.nodeRadius}
          fill={
            selected
              ? designTokens.colors['accent']
              : related
                ? designTokens.colors['accent-soft']
                : designTokens.colors['surface']
          }
          stroke={
            selected || related
              ? designTokens.colors['accent']
              : designTokens.colors['graph-node-line']
          }
          strokeWidth="var(--flow-stroke-width, 1)"
        />
      </svg>
      <span>{String(data.label)}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
const nodeTypes = { module: GraphNode };
function Ready({
  token,
  onReady,
  graph,
}: {
  token: number;
  onReady: (token: number) => void;
  graph: Graph;
}) {
  const { setViewport, viewportInitialized } = useReactFlow();
  const width = useStore((state) => state.width),
    height = useStore((state) => state.height);
  const initializedToken = useRef<number | null>(null);
  useEffect(() => {
    if (!viewportInitialized || !width || !height || initializedToken.current === token) return;
    initializedToken.current = token;
    let cancelled = false,
      firstFrame = 0,
      secondFrame = 0;
    const viewport = initialGraphViewport(graph, width, height);
    void setViewport({ x: viewport.x, y: viewport.y, zoom: viewport.scale }, { duration: 0 }).then(
      () => {
        firstFrame = requestAnimationFrame(() => {
          secondFrame = requestAnimationFrame(() => {
            if (!cancelled) onReady(token);
          });
        });
      },
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [viewportInitialized, width, height, token, graph, setViewport, onReady]);
  return null;
}
export function ReactFlowGraph({
  graph,
  selected,
  onSelect,
  pathNodes,
  pathEdges,
  token,
  onReady,
  culling,
}: {
  graph: Graph;
  selected: string | null;
  onSelect: (id: string | null) => void;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  token: number;
  onReady: (token: number) => void;
  culling: boolean;
}) {
  const { zoom } = useViewport();
  const nodes = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'module',
        initialWidth: W,
        initialHeight: H,
        data: { label: n.label, related: pathNodes.has(n.id) },
        position: { x: n.x, y: n.y },
        selected: n.id === selected,
        style: { width: W, height: H },
        draggable: false,
      })),
    [graph, selected, pathNodes],
  );
  const edges = useMemo(
    () =>
      graph.edges.map((e) => ({
        ...e,
        style: {
          stroke: pathEdges.has(e.id)
            ? designTokens.colors['accent']
            : designTokens.colors['graph-edge'],
          strokeWidth: pathEdges.has(e.id)
            ? 'calc(2 * var(--flow-stroke-width, 1))'
            : 'var(--flow-stroke-width, 1)',
        },
      })),
    [graph, pathEdges],
  );
  return (
    <ReactFlow
      style={
        {
          '--flow-label-opacity': zoom > designTokens.graph.labelMinZoom ? 1 : 0,
          '--flow-stroke-width': 1 / zoom,
        } as CSSProperties
      }
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onlyRenderVisibleElements={culling}
      minZoom={0.005}
      maxZoom={3}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable
      onNodeClick={(_, n) => onSelect(n.id)}
      onPaneClick={() => onSelect(null)}
      proOptions={{ hideAttribution: false }}
    >
      <Ready token={token} onReady={onReady} graph={graph} />
    </ReactFlow>
  );
}
