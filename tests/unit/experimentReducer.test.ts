import { describe, expect, it } from 'vitest';
import { generateGraph } from '@/domain/graph';
import { initialState, experimentReducer } from '@/state/graphExperimentReducer';
import type { Result } from '@/state/types';
const result: Result = {
  renderer: 'canvas',
  count: 100,
  visible: 100,
  view: 'tree',
  source: 1,
  depth: 8,
  focus: null,
  culling: true,
  prepare: 1,
  present: 10,
  maxGap: 16,
  time: 'test',
};
describe('實驗狀態的轉換規則', () => {
  it('未選節點不能進入路徑聚焦', () => {
    const state = initialState();
    expect(experimentReducer(state, { type: 'toggleFocus' })).toBe(state);
  });
  it('清除選取同時清除聚焦，避免矛盾狀態', () => {
    let state = experimentReducer(initialState(), { type: 'select', id: '1' });
    state = experimentReducer(state, { type: 'toggleFocus' });
    expect(state.focused).toBe(true);
    state = experimentReducer(state, { type: 'select', id: null });
    expect(state.selected).toBeNull();
    expect(state.focused).toBe(false);
  });
  it('載入新資料原子更新渲染器、圖與操作狀態', () => {
    const graph = generateGraph(100, 'network');
    const state = experimentReducer(
      { ...initialState(), selected: '1', focused: true },
      { type: 'start', graph, renderer: 'reactflow', token: 2 },
    );
    expect(state.graph).toBe(graph);
    expect(state.renderer).toBe('reactflow');
    expect(state.selected).toBeNull();
    expect(state.focused).toBe(false);
    expect(state.status).toBe('rendering');
  });
  it('忽略過期的呈現回呼，避免把前一版數據記到新一版', () => {
    const state = experimentReducer(initialState(), {
      type: 'start',
      graph: generateGraph(100, 'tree'),
      renderer: 'canvas',
      token: 2,
    });
    expect(
      experimentReducer(state, { type: 'complete', token: 1, result, continueBatch: false }),
    ).toBe(state);
  });
  it('完成結果只記一次，重複回呼不新增紀錄', () => {
    let state = experimentReducer(initialState(), {
      type: 'start',
      graph: generateGraph(100, 'tree'),
      renderer: 'canvas',
      token: 1,
    });
    state = experimentReducer(state, { type: 'complete', token: 1, result, continueBatch: false });
    expect(state.results).toEqual([result]);
    expect(state.status).toBe('idle');
    expect(
      experimentReducer(state, { type: 'complete', token: 1, result, continueBatch: false }),
    ).toBe(state);
  });
  it('批次兩版之間維持操作鎖定', () => {
    let state = experimentReducer(initialState(), {
      type: 'start',
      graph: generateGraph(100, 'tree'),
      renderer: 'reactflow',
      token: 1,
    });
    state = experimentReducer(state, { type: 'complete', token: 1, result, continueBatch: true });
    expect(state.status).toBe('preparing');
    expect(state.results).toHaveLength(1);
  });
});

it('切換請求立即更新頁籤並進入準備狀態，尚未替換圖資料', () => {
  const previous = initialState();
  const next = experimentReducer(previous, { type: 'request', renderer: 'reactflow', token: 7 });
  expect(next.renderer).toBe('reactflow');
  expect(next.status).toBe('preparing');
  expect(next.graph).toBe(previous.graph);
  expect(
    experimentReducer(next, { type: 'complete', token: 7, result, continueBatch: false }),
  ).toBe(next);
});
