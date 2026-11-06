import { generateGraph, type Graph } from '@/domain/graph';
import { defaultConfig, type Renderer, type Result } from '@/state/types';
export type ExperimentState = {
  graph: Graph;
  renderer: Renderer;
  selected: string | null;
  focused: boolean;
  token: number;
  status: 'idle' | 'preparing' | 'rendering';
  results: Result[];
};
export function initialState(config = defaultConfig): ExperimentState {
  return {
    graph: generateGraph(config.count, config.view, config.source),
    renderer: 'reactflow',
    selected: null,
    focused: false,
    token: 0,
    status: 'idle',
    results: [],
  };
}
export type ExperimentAction =
  | { type: 'request'; renderer: Renderer; token: number }
  | { type: 'start'; graph: Graph; renderer: Renderer; token: number }
  | { type: 'failure' }
  | { type: 'select'; id: string | null }
  | { type: 'toggleFocus' }
  | { type: 'complete'; token: number; result: Result; continueBatch: boolean };
export function experimentReducer(
  state: ExperimentState,
  action: ExperimentAction,
): ExperimentState {
  switch (action.type) {
    case 'request':
      return {
        ...state,
        renderer: action.renderer,
        token: action.token,
        selected: null,
        focused: false,
        status: 'preparing',
      };
    case 'start':
      return {
        ...state,
        graph: action.graph,
        renderer: action.renderer,
        token: action.token,
        selected: null,
        focused: false,
        status: 'rendering',
      };
    case 'failure':
      return { ...state, status: 'idle' };
    case 'select':
      return { ...state, selected: action.id, focused: action.id ? state.focused : false };
    case 'toggleFocus':
      return state.selected ? { ...state, focused: !state.focused } : state;
    case 'complete':
      if (state.status !== 'rendering' || action.token !== state.token) return state;
      return {
        ...state,
        results: [...state.results, action.result],
        status: action.continueBatch ? 'preparing' : 'idle',
      };
  }
}
