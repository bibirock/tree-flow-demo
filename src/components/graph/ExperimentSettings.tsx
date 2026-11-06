import type { View } from '@/domain/graph';
import type { ExperimentModel } from '@/hooks/useGraphExperiment';
type Props = Pick<
  ExperimentModel,
  | 'count'
  | 'setCount'
  | 'source'
  | 'setSource'
  | 'view'
  | 'setView'
  | 'depth'
  | 'setDepth'
  | 'culling'
  | 'setCulling'
  | 'busy'
  | 'renderer'
  | 'run'
  | 'selected'
  | 'choose'
  | 'focused'
  | 'toggleFocus'
  | 'graph'
>;
export function ExperimentSettings({
  count,
  setCount,
  source,
  setSource,
  view,
  setView,
  depth,
  setDepth,
  culling,
  setCulling,
  busy,
  renderer,
  run,
  selected,
  choose,
  focused,
  toggleFocus,
  graph,
}: Props) {
  return (
    <aside className="settings">
      <div className="settings-title">
        實驗設定<span>CONFIG</span>
      </div>
      <label>
        資料規模
        <select
          aria-label="資料規模"
          disabled={busy}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[100, 500, 2500, 10000, 20000].map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString()} 個節點
            </option>
          ))}
        </select>
      </label>
      <label>
        資料來源
        <select
          aria-label="資料來源"
          disabled={busy}
          value={source}
          onChange={(e) => setSource(Number(e.target.value))}
        >
          <option value={1}>合成來源 A</option>
          <option value={2}>合成來源 B</option>
        </select>
      </label>
      <label>
        圖形視圖
        <select
          aria-label="圖形視圖"
          disabled={busy}
          value={view}
          onChange={(e) => setView(e.target.value as View)}
        >
          <option value="tree">樹狀圖</option>
          <option value="network">網狀圖（含跨支連線）</option>
        </select>
      </label>
      <button className="apply" disabled={busy} onClick={() => run(renderer)}>
        載入並量測
      </button>

      <div className="divider" />
      <label>
        顯示深度 <b>{depth === 8 ? '全部' : depth}</b>
        <input
          aria-label="顯示深度"
          type="range"
          min="0"
          max="8"
          value={depth}
          disabled={busy}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </label>
      <label>
        選取節點
        <select
          aria-label="選取節點"
          value={selected ?? ''}
          disabled={busy}
          onChange={(e) => choose(e.target.value || null)}
        >
          <option value="">點選圖形或選取節點</option>
          {graph.nodes.slice(0, 100).map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </label>
      <button
        className={`focus-button ${focused ? 'on' : ''}`}
        disabled={!selected || busy}
        aria-pressed={focused}
        onClick={() => toggleFocus()}
      >
        {focused ? '顯示完整圖形' : '只看關聯路徑'}
      </button>
      <button
        className="text-button clear"
        disabled={!selected || busy}
        onClick={() => choose(null)}
      >
        清除選取
      </button>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={culling}
          disabled={busy}
          onChange={(e) => setCulling(e.target.checked)}
        />
        React Flow 可見範圍渲染
      </label>
    </aside>
  );
}
