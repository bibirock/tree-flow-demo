import { useGraphExperiment } from '@/hooks/useGraphExperiment';
import { ExperimentLayout } from '@/layouts/ExperimentLayout';
import { Metrics } from '@/pages/graph-comparison/components/Metrics';
import { ResultsPanel } from '@/pages/graph-comparison/components/ResultsPanel';
export function GraphComparisonPage() {
  const model = useGraphExperiment();
  return (
    <>
      <Metrics
        renderer={model.renderer}
        latest={model.latest}
        visible={model.visible}
        graph={model.graph}
      />
      <ExperimentLayout model={model} />
      <ResultsPanel results={model.results} />
    </>
  );
}
