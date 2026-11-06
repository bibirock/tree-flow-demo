import { useGraphExperiment } from '@/hooks/useGraphExperiment';
import { ExperimentLayout } from '@/layouts/ExperimentLayout';
import { defaultConfig } from '@/state/types';
const testConfig = { ...defaultConfig, count: 100 };
export function FallbackTestPage() {
  const model = useGraphExperiment(testConfig);
  return (
    <>
      <section className="fault-controls">
        <h1>錯誤回退測試</h1>
        <p>
          以合成資料觸發 Canvas 錯誤，驗證自動改用 React
          Flow；回退使用同一份已載入資料，且不循環重試。
        </p>
        <div>
          <button disabled={model.busy} onClick={() => model.simulateFault('render')}>
            模擬元件渲染錯誤
          </button>
          <button disabled={model.busy} onClick={() => model.simulateFault('draw')}>
            模擬非同步繪製錯誤
          </button>
          <button disabled={model.busy} onClick={() => model.simulateFault('none')}>
            正常載入 Canvas
          </button>
        </div>
        <p className="fault-summary">
          節點：
          <span data-testid="visible-count">
            {model.visible.nodes.length.toLocaleString()}/{' '}
            {model.graph.nodes.length.toLocaleString()}
          </span>
        </p>
      </section>
      <ExperimentLayout model={model} />
    </>
  );
}
