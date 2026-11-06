import { ExperimentSettings } from '@/components/graph/ExperimentSettings';
import { GraphViewport } from '@/components/graph/GraphViewport';
import type { ExperimentModel } from '@/hooks/useGraphExperiment';
export function ExperimentLayout({ model }: { model: ExperimentModel }) {
  return (
    <section className="workspace">
      <div className="toolbar">
        <div className="renderer-switch" role="group" aria-label="渲染器">
          <button aria-pressed="true" className="active">
            React Flow <span>DOM</span>
          </button>
        </div>
        <button className="primary" disabled={model.busy} onClick={() => model.run('reactflow')}>
          重新量測
        </button>
      </div>
      <div className="work-body">
        <ExperimentSettings {...model} />
        <GraphViewport {...model} />
      </div>
    </section>
  );
}
