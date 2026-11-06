import { useState } from 'react';
import { rendererNames as names, type Result } from '@/state/types';
export function ResultsPanel({ results }: { results: Result[] }) {
  const [tab, setTab] = useState<'history' | 'method'>('history');
  return (
    <section className="results">
      <div className="result-header">
        <div className="tabs">
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            量測紀錄<span>{results.length}</span>
          </button>
          <button className={tab === 'method' ? 'active' : ''} onClick={() => setTab('method')}>
            實驗方法
          </button>
        </div>
      </div>
      {tab === 'history' ? (
        results.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>渲染器</th>
                  <th>資料 / 顯示</th>
                  <th>視圖</th>
                  <th>準備時間</th>
                  <th>操作至呈現</th>
                  <th>最大幀間隔</th>
                  <th>時間</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`table-dot ${r.renderer}`} />
                      {names[r.renderer]}
                    </td>
                    <td>
                      {r.count.toLocaleString()} / {r.visible.toLocaleString()}
                    </td>
                    <td>{r.view === 'tree' ? '樹狀' : '網狀'}</td>
                    <td>{r.prepare.toFixed(1)} ms</td>
                    <td className="emphasis">{r.present.toFixed(1)} ms</td>
                    <td>{r.maxGap.toFixed(1)} ms</td>
                    <td>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <p>尚無量測紀錄</p>
          </div>
        )
      ) : (
        <div className="method">
          <p>兩版共用合成資料、座標、尺寸與路徑邏輯；只依序掛載一種渲染器。</p>
          <p>
            準備時間包含資料產生與固定佈局；操作至呈現包含 loading
            排程、資料準備與渲染，從點擊操作開始，到渲染器就緒後下一幀。
          </p>
          <p>
            此時間是瀏覽器主執行緒可觀察的代理值，不保證 GPU
            已完成顯示。動畫幀間隔也不是完整的卡頓偵測。
          </p>
          <p>選取、聚焦與深度操作不自動新增量測；重新量測會清除選取，沿用目前深度。</p>
          <p>
            正式比較請用 production preview、相同條件、多次量測；結果不預設 Canvas
            一定比較快。無網路請求與跨次佈局快取。
          </p>
          <p>來源 B 改變標籤以驗證切換，圖形結構保持一致。這不是原業務資料或完整功能重現。</p>
        </div>
      )}
    </section>
  );
}
