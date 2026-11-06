import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { ReactFlowGraph } from '@/components/graph/renderers/ReactFlowGraph';
import type { ExperimentModel } from '@/hooks/useGraphExperiment';
function Controls() {
  const flow = useReactFlow();
  return (
    <div className="view-controls">
      <button aria-label="放大" onClick={() => flow.zoomIn()}>
        +
      </button>
      <button aria-label="縮小" onClick={() => flow.zoomOut()}>
        −
      </button>
      <button
        aria-label="適應畫面"
        onClick={() => flow.fitView({ padding: '50px', minZoom: 0.005, maxZoom: 1.2 })}
      >
        適應
      </button>
    </div>
  );
}
export function GraphViewport(model: ExperimentModel) {
  const { graph, visible, selected, path, choose, token, ready, status, busy, culling } = model;
  return (
    <div className="graph-area" data-testid="graph-area" aria-busy={busy}>
      <div className="canvas-top">
        <span>{busy ? '正在呈現圖形' : '圖形已就緒'}</span>
        <span className="mono">React Flow / {visible.nodes.length} NODES</span>
      </div>
      <ReactFlowProvider key={token}>
        <div className="graph-inner">
          {status === 'preparing' ? null : (
            <ReactFlowGraph
              graph={visible}
              selected={selected}
              pathNodes={path.nodeIds}
              pathEdges={path.edgeIds}
              onSelect={choose}
              token={token}
              onReady={ready}
              culling={culling}
            />
          )}
        </div>
        <Controls />
      </ReactFlowProvider>
      {busy && (
        <div className="loading-overlay">
          <div className="loading-card" role="status">
            <strong>正在載入 React Flow</strong>
            <div className="loading-track" role="progressbar" aria-label="React Flow 載入進度">
              <span />
            </div>
          </div>
        </div>
      )}
      <div className="selection-summary">
        {selected
          ? `已選取 ${graph.nodes.find((n) => n.id === selected)?.label} · ${path.nodeIds.size} 個關聯節點`
          : '選取節點，探索上下游路徑'}
      </div>
    </div>
  );
}
