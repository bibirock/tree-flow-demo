import { fitGraphViewport, initialGraphViewport } from '@/components/graph/renderers/viewport';
import { designTokens } from '@/design/tokens';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { H, W, type Graph } from '@/domain/graph';
import { createGraphIndex } from '@/components/graph/renderers/canvasIndex';
export type CanvasHandle = { fit: () => void; zoom: (factor: number) => void };
type Props = {
  graph: Graph;
  selected: string | null;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  onSelect: (id: string | null) => void;
  onReady: (token: number) => void;
  token: number;
  onError?: (error: Error) => void;
  injectDrawFault?: boolean;
};
export const CanvasGraph = forwardRef<CanvasHandle, Props>(function CanvasGraph(props, ref) {
  const {
    graph,
    selected,
    pathNodes,
    pathEdges,
    token,
    onReady,
    onSelect,
    onError,
    injectDrawFault,
  } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewport = useRef({ x: 0, y: 0, scale: 1 });
  const fitted = useRef(false);
  const index = useMemo(() => createGraphIndex(graph), [graph]);
  const draw = useRef<() => void>(() => {}),
    fit = useRef<() => void>(() => {});
  useImperativeHandle(
    ref,
    () => ({
      fit: () => fit.current(),
      zoom: (factor) => {
        const el = canvas.current;
        if (!el) return;
        const v = viewport.current,
          cx = el.clientWidth / 2,
          cy = el.clientHeight / 2;
        const scale = Math.max(0.01, Math.min(3, v.scale * factor));
        v.x = cx - ((cx - v.x) * scale) / v.scale;
        v.y = cy - ((cy - v.y) * scale) / v.scale;
        v.scale = scale;
        draw.current();
      },
    }),
    [],
  );
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) {
      onError?.(new Error('Canvas 2D context unavailable'));
      return;
    }
    let frame = 0,
      readyFrame = 0,
      disposed = false,
      pending = false;
    const { byId, grid } = index;
    function paint() {
      if (injectDrawFault) throw new Error('Demo: Canvas 非同步繪製錯誤');
      pending = false;
      if (!ctx || !el || disposed) return;
      const width = el.clientWidth,
        height = el.clientHeight,
        dpr = window.devicePixelRatio || 1;
      if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) {
        el.width = Math.round(width * dpr);
        el.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const v = viewport.current;
      ctx.translate(v.x, v.y);
      ctx.scale(v.scale, v.scale);
      const left = -v.x / v.scale - W,
        right = (width - v.x) / v.scale + W;
      const top = -v.y / v.scale - H,
        bottom = (height - v.y) / v.scale + H;
      for (const highlighted of [false, true]) {
        ctx.beginPath();
        ctx.strokeStyle = highlighted
          ? designTokens.colors['accent']
          : designTokens.colors['graph-edge'];
        ctx.lineWidth = (highlighted ? 2 : 1) / v.scale;
        for (const e of graph.edges) {
          if (pathEdges.has(e.id) !== highlighted) continue;
          const a = byId.get(e.source)!,
            b = byId.get(e.target)!;
          if (
            Math.max(a.x, b.x) + W < left ||
            Math.min(a.x, b.x) > right ||
            Math.max(a.y, b.y) + H < top ||
            Math.min(a.y, b.y) > bottom
          )
            continue;
          const x1 = a.x + W / 2,
            y1 = a.y + H,
            x2 = b.x + W / 2,
            y2 = b.y,
            mid = (y1 + y2) / 2;
          ctx.moveTo(x1, y1);
          ctx.bezierCurveTo(x1, mid, x2, mid, x2, y2);
        }
        ctx.stroke();
      }
      for (const n of graph.nodes) {
        if (n.x + W < left || n.x > right || n.y + H < top || n.y > bottom) continue;
        const active = pathNodes.has(n.id),
          nodeSelected = selected === n.id;
        ctx.fillStyle = nodeSelected
          ? designTokens.colors['accent']
          : active
            ? designTokens.colors['accent-soft']
            : designTokens.colors['surface'];
        ctx.strokeStyle = active
          ? designTokens.colors['accent']
          : designTokens.colors['graph-node-line'];
        ctx.lineWidth = 1 / v.scale;
        ctx.beginPath();
        ctx.roundRect(n.x, n.y, W, H, designTokens.graph.nodeRadius);
        ctx.fill();
        ctx.stroke();
        if (v.scale > designTokens.graph.labelMinZoom) {
          ctx.fillStyle = nodeSelected
            ? designTokens.colors['surface']
            : designTokens.colors['graph-node-text'];
          ctx.font = `${designTokens.fontSize.graph}px ${designTokens.fontFamily.mono.join(', ')}`;
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x + W / 2, n.y + 26);
        }
      }
      if (lastReady !== token) {
        lastReady = token;
        readyFrame = requestAnimationFrame(() => {
          if (!disposed) onReady(token);
        });
      }
    }
    let lastReady = -1;
    draw.current = () => {
      if (!pending) {
        pending = true;
        frame = requestAnimationFrame(() => {
          try {
            paint();
          } catch (error) {
            onError?.(error instanceof Error ? error : new Error(String(error)));
          }
        });
      }
    };
    fit.current = () => {
      viewport.current = fitGraphViewport(graph, el.clientWidth, el.clientHeight);
      draw.current();
    };
    const observer = new ResizeObserver(() => draw.current());
    observer.observe(el);
    let drag: { x: number; y: number; moved: boolean } | null = null;
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      viewport.current.x += dx;
      viewport.current.y += dy;
      drag.x = e.clientX;
      drag.y = e.clientY;
      draw.current();
    };
    const up = (e: PointerEvent) => {
      if (drag && !drag.moved) {
        const r = el.getBoundingClientRect(),
          v = viewport.current,
          x = (e.clientX - r.left - v.x) / v.scale,
          y = (e.clientY - r.top - v.y) / v.scale;
        let found: string | null = null;
        for (let gx = Math.floor(x / 200) - 1; gx <= Math.floor(x / 200); gx++)
          for (const n of grid.get(`${gx},${Math.floor(y / 128)}`) ?? [])
            if (x >= n.x && x <= n.x + W && y >= n.y && y <= n.y + H) found = n.id;
        onSelect(found);
      }
      drag = null;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect(),
        v = viewport.current,
        x = e.clientX - r.left,
        y = e.clientY - r.top;
      const next = Math.max(0.005, Math.min(3, v.scale * Math.exp(-e.deltaY * 0.001)));
      v.x = x - ((x - v.x) * next) / v.scale;
      v.y = y - ((y - v.y) * next) / v.scale;
      v.scale = next;
      draw.current();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    if (!fitted.current) {
      viewport.current = initialGraphViewport(graph, el.clientWidth, el.clientHeight);
      draw.current();
      fitted.current = true;
    } else draw.current();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [
    graph,
    index,
    selected,
    pathNodes,
    pathEdges,
    token,
    onReady,
    onSelect,
    onError,
    injectDrawFault,
  ]);
  return (
    <canvas
      ref={canvas}
      className="graph-canvas"
      aria-label="Canvas 關聯圖；可透過旁邊的節點選單選取路徑"
    />
  );
});
