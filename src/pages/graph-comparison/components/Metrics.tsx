import type { ExperimentModel } from '@/hooks/useGraphExperiment';
import { rendererNames as names } from '@/state/types';
export function Metrics({
  renderer,
  latest,
  visible,
  graph,
}: Pick<ExperimentModel, 'renderer' | 'latest' | 'visible' | 'graph'>) {
  return (
    <section className="metrics">
      <article>
        <span>目前渲染器</span>
        <strong>
          {names[renderer]}
          <em className="pill">{renderer === 'canvas' ? '自繪畫布' : '元件渲染'}</em>
        </strong>
        <small>React 重製展示 · 原工作專案為 VueFlow</small>
      </article>
      <article>
        <span>
          操作至圖形呈現 <span className="mono">ms</span>
        </span>
        <strong data-testid="present-ms">
          {latest ? latest.present.toFixed(1) : '—'}
          <em>ms</em>
        </strong>
        <small>點擊操作 → 就緒後下一幀</small>
      </article>
      <article>
        <span>
          最大幀間隔 <span className="mono">ms</span>
        </span>
        <strong>
          {latest ? latest.maxGap.toFixed(1) : '—'}
          <em>ms</em>
        </strong>
        <small>測試期間的 animation frame 間隔</small>
      </article>
      <article>
        <span>目前顯示節點</span>
        <strong data-testid="visible-count">
          {visible.nodes.length.toLocaleString()}
          <em>/ {graph.nodes.length.toLocaleString()}</em>
        </strong>
        <small data-testid="edge-count">{visible.edges.length.toLocaleString()} 條關聯連線</small>
      </article>
    </section>
  );
}
