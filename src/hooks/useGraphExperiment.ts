import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { generateGraph, collectPath, filterGraph, type View, type Graph } from '@/domain/graph';
import { experimentReducer, initialState } from '@/state/graphExperimentReducer';
import {
  defaultConfig,
  type Config,
  type Renderer,
  type Result,
  type FaultMode,
} from '@/state/types';

type PendingRun = {
  token: number;
  start: number;
  result: Omit<Result, 'present' | 'maxGap' | 'time'> | null;
};
export function useGraphExperiment(initialConfig: Config = defaultConfig) {
  const [state, dispatch] = useReducer(experimentReducer, initialConfig, initialState);
  const [config, setConfig] = useState<Config>(initialConfig);
  const [depth, setDepth] = useState(8);
  const [fault, setFault] = useState<FaultMode>('none');
  const [failure, setFailure] = useState<{
    message: string;
    status: 'recovering' | 'recovered' | 'failed';
  } | null>(null);
  const handledFailure = useRef(-1),
    appliedConfig = useRef(initialConfig),
    appliedGraph = useRef(state.graph);

  const sequence = useRef(0),
    pending = useRef<PendingRun | null>(null);
  const queue = useRef<Renderer[]>([]),
    nextRun = useRef<(r: Renderer) => void>(() => {});
  const maxGap = useRef(0),
    lastFrame = useRef(0),
    nextTimer = useRef<number | undefined>(undefined),
    prepareFrame = useRef(0),
    prepareTimer = useRef<number | undefined>(undefined);
  const busy = state.status !== 'idle';
  const path = useMemo(
    () => collectPath(state.graph, state.selected),
    [state.graph, state.selected],
  );
  // Selection alone must not regenerate graph arrays or the renderer's spatial index.
  const baseVisible = useMemo(() => filterGraph(state.graph, depth, null), [state.graph, depth]);
  const visible = useMemo(
    () =>
      state.focused && state.selected ? filterGraph(baseVisible, depth, path.nodeIds) : baseVisible,
    [baseVisible, depth, state.focused, state.selected, path],
  );
  const choose = useCallback((id: string | null) => dispatch({ type: 'select', id }), []);
  const toggleFocus = useCallback(() => dispatch({ type: 'toggleFocus' }), []);
  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      if (pending.current) maxGap.current = Math.max(maxGap.current, now - lastFrame.current);
      lastFrame.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(nextTimer.current);
      window.clearTimeout(prepareTimer.current);
      cancelAnimationFrame(prepareFrame.current);
      pending.current = null;
      queue.current = [];
    };
  }, []);
  const run = useCallback(
    (renderer: Renderer, override?: { config?: Config; graph?: Graph; fault?: FaultMode }) => {
      const settings = override?.config ?? config;
      setFault(override?.fault ?? 'none');
      const token = ++sequence.current,
        start = performance.now();
      maxGap.current = 0;
      lastFrame.current = start;
      pending.current = { token, start, result: null };
      dispatch({ type: 'request', renderer, token });
      // Give the browser a paint opportunity for the selected tab and loading UI.
      // No artificial delay or fabricated progress percentage is added.
      prepareFrame.current = requestAnimationFrame(() => {
        prepareFrame.current = requestAnimationFrame(() => {
          prepareTimer.current = window.setTimeout(() => {
            if (pending.current?.token !== token) return;
            const begin = performance.now();
            const graph =
              override?.graph ?? generateGraph(settings.count, settings.view, settings.source);
            appliedConfig.current = settings;
            appliedGraph.current = graph;
            const filtered = filterGraph(graph, depth, null);
            const prepare = performance.now() - begin;
            pending.current = {
              token,
              start,
              result: {
                ...settings,
                renderer,
                depth,
                focus: null,
                visible: filtered.nodes.length,
                prepare,
              },
            };
            dispatch({ type: 'start', graph, renderer, token });
          }, 0);
        });
      });
    },
    [config, depth],
  );
  useEffect(() => {
    nextRun.current = run;
  }, [run]);
  const ready = useCallback((token: number) => {
    const current = pending.current;
    if (!current || !current.result || token !== current.token) return;
    const now = performance.now();
    maxGap.current = Math.max(maxGap.current, now - lastFrame.current);
    const result: Result = {
      ...current.result,
      present: now - current.start,
      maxGap: maxGap.current,
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
    };
    pending.current = null;
    setFailure((previous) =>
      previous?.status === 'recovering' ? { ...previous, status: 'recovered' } : previous,
    );
    const next = queue.current.shift();
    dispatch({ type: 'complete', token, result, continueBatch: !!next });
    if (next) nextTimer.current = window.setTimeout(() => nextRun.current(next), 300);
  }, []);
  const compare = useCallback(() => {
    queue.current = ['canvas'];
    run('reactflow');
  }, [run]);
  const handleRendererError = useCallback(
    (error: Error) => {
      if (handledFailure.current === state.token) return;
      handledFailure.current = state.token;
      queue.current = [];
      if (state.renderer === 'canvas') {
        setFailure({ message: error.message, status: 'recovering' });
        run('reactflow', { config: appliedConfig.current, graph: appliedGraph.current });
      } else {
        pending.current = null;
        setFailure({ message: error.message, status: 'failed' });
        dispatch({ type: 'failure' });
      }
    },
    [state.renderer, state.token, run],
  );
  const simulateFault = useCallback(
    (mode: FaultMode) => {
      setFailure(null);
      run('canvas', { fault: mode });
    },
    [run],
  );
  const latest = useMemo(
    () => [...state.results].reverse().find((r) => r.renderer === state.renderer),
    [state.results, state.renderer],
  );
  return {
    ...state,
    ...config,
    depth,
    busy,
    path,
    visible,
    latest,
    choose,
    toggleFocus,
    ready,
    run,
    compare,
    setDepth,
    fault,
    failure,
    handleRendererError,
    simulateFault,
    setCount: (count: number) => setConfig((c) => ({ ...c, count })),
    setView: (view: View) => setConfig((c) => ({ ...c, view })),
    setSource: (source: number) => setConfig((c) => ({ ...c, source })),
    setCulling: (culling: boolean) => setConfig((c) => ({ ...c, culling })),
  };
}
export type ExperimentModel = ReturnType<typeof useGraphExperiment>;
