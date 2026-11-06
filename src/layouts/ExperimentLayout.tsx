import { ExperimentSettings } from '@/components/graph/ExperimentSettings';
import { GraphViewport } from '@/components/graph/GraphViewport';
import type { ExperimentModel } from '@/hooks/useGraphExperiment';
export function ExperimentLayout({ model }: { model: ExperimentModel }) {
  const { renderer, busy, run, compare } = model;
  return (
    <section className="workspace">
      <div className="toolbar">
        <div className="renderer-switch" role="group" aria-label="渲染器">
          <button
            data-testid="renderer-reactflow"
            aria-pressed={renderer === 'reactflow'}
            disabled={busy}
            className={renderer === 'reactflow' ? 'active' : ''}
            onClick={() => run('reactflow')}
          >
            React Flow<span>DOM</span>
          </button>
          <button
            data-testid="renderer-canvas"
            aria-pressed={renderer === 'canvas'}
            disabled={busy}
            className={renderer === 'canvas' ? 'active' : ''}
            onClick={() => run('canvas')}
          >
            Canvas<span>2D</span>
          </button>
        </div>
        <div className="toolbar-actions">
          <button className="text-button" disabled={busy} onClick={() => run(renderer)}>
            重新量測
          </button>
          <button
            className="primary"
            disabled={busy}
            onClick={() => {
              compare();
            }}
          >
            依序比較兩版
          </button>
        </div>
      </div>
      <div className="work-body">
        <ExperimentSettings {...model} />
        <GraphViewport {...model} />
      </div>
    </section>
  );
}
