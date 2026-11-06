import type { View } from '@/domain/graph';
export type Renderer = 'reactflow' | 'canvas';
export const rendererNames = { canvas: 'Canvas', reactflow: 'React Flow' };
export type Config = { count: number; view: View; source: number; culling: boolean };
export type Result = {
  renderer: Renderer;
  count: number;
  visible: number;
  view: View;
  source: number;
  depth: number;
  focus: string | null;
  culling: boolean;
  prepare: number;
  present: number;
  maxGap: number;
  time: string;
};

export const defaultConfig: Config = { count: 10000, view: 'tree', source: 1, culling: true };

export type FaultMode = 'none' | 'render' | 'draw';
