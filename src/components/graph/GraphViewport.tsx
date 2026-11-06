import { RendererErrorBoundary } from '@/components/graph/renderers/RendererErrorBoundary';
import { useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { CanvasGraph, type CanvasHandle } from '@/components/graph/renderers/CanvasGraph';
import { ReactFlowGraph } from '@/components/graph/renderers/ReactFlowGraph';
import { rendererNames as names, type Renderer } from '@/state/types';
import type { ExperimentModel } from '@/hooks/useGraphExperiment';
function ViewControls({
  canvasRef,
  renderer,
}: {
  canvasRef: React.RefObject<CanvasHandle | null>;
  renderer: Renderer;
}) {
  const flow = useReactFlow();
  return (
    <div className="view-controls">
      <button
        aria-label="放大"
        onClick={() => (renderer === 'canvas' ? canvasRef.current?.zoom(1.4) : flow.zoomIn())}
      >
        +
      </button>
      <button
        aria-label="縮小"
        onClick={() => (renderer === 'canvas' ? canvasRef.current?.zoom(1 / 1.4) : flow.zoomOut())}
      >
        −
      </button>
      <span />
      <button
        aria-label="適應畫面"
        onClick={() =>
          renderer === 'canvas'
            ? canvasRef.current?.fit()
            : flow.fitView({ minZoom: 0.005, maxZoom: 1.2, padding: '50px' })
        }
      >
        適應
      </button>
    </div>
  );
}
export function GraphViewport({
  renderer,
  token,
  visible,
  selected,
  path,
  choose,
  ready,
  culling,
  busy,
  graph,
  status,
  fault,
  failure,
  handleRendererError,
}: Pick<
  ExperimentModel,
  | 'renderer'
  | 'token'
  | 'visible'
  | 'selected'
  | 'path'
  | 'choose'
  | 'ready'
  | 'culling'
  | 'busy'
  | 'graph'
  | 'status'
  | 'fault'
  | 'failure'
  | 'handleRendererError'
>) {
  const canvasRef = useRef<CanvasHandle>(null);
  return (
    <div className="graph-area" data-testid="graph-area" aria-busy={busy}>
      <div className="canvas-top">
        <span>
          <i />
          {busy ? '正在呈現圖形' : '圖形已就緒'}
        </span>
        <span className="mono">
          {names[renderer]} / {visible.nodes.length.toLocaleString()} NODES
        </span>
      </div>
      <ReactFlowProvider key={`${renderer}-${token}`}>
        <div className="graph-inner">
          {status === 'preparing' ? null : renderer === 'canvas' ? (
            <RendererErrorBoundary
              key={token}
              onError={handleRendererError}
              injectFault={fault === 'render'}
            >
              <CanvasGraph
                ref={canvasRef}
                graph={visible}
                selected={selected}
                pathNodes={path.nodeIds}
                pathEdges={path.edgeIds}
                onSelect={choose}
                onReady={ready}
                token={token}
                onError={handleRendererError}
                injectDrawFault={fault === 'draw'}
              />
            </RendererErrorBoundary>
          ) : (
            <RendererErrorBoundary key={token} onError={handleRendererError}>
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
            </RendererErrorBoundary>
          )}
        </div>
        <ViewControls canvasRef={canvasRef} renderer={renderer} />
      </ReactFlowProvider>
      {busy && (
        <div className="loading-overlay" data-testid="render-loading">
          <div className="loading-card" role="status" aria-live="polite">
            <strong>正在載入 {names[renderer]}</strong>
            <p>{status === 'preparing' ? '正在準備圖形資料…' : '正在渲染節點與連線…'}</p>
            <div
              className="loading-track"
              role="progressbar"
              aria-label={`${names[renderer]} 載入進度`}
            >
              <span />
            </div>
          </div>
        </div>
      )}
      {failure && (
        <div className="fallback-notice" role="alert" data-testid="fallback-notice">
          {failure.status === 'recovering'
            ? 'Canvas 發生錯誤，正在切換 React Flow。'
            : failure.status === 'recovered'
              ? '已自動切換至 React Flow，圖形可繼續操作。'
              : 'React Flow 也發生錯誤，已停止重試。'}
          <details>
            <summary>錯誤資訊</summary>
            {failure.message}
          </details>
        </div>
      )}
      <div className="graph-legend">
        <span>
          <i />
          一般節點
        </span>
        <span>
          <i className="orange" />
          關聯路徑
        </span>
        <span>拖曳平移 · 滾輪縮放</span>
      </div>
      <div className="selection-summary" data-testid="selection-summary" aria-live="polite">
        {selected
          ? `已選取 ${graph.nodes.find((n) => n.id === selected)?.label} · ${path.nodeIds.size} 個關聯節點 · ${path.edgeIds.size} 條關聯連線`
          : '選取節點，探索上下游路徑'}
      </div>
    </div>
  );
}
