import { describe, expect, it } from 'vitest';
import { designTokens } from '@/design/tokens';
import tailwindConfig from '../../tailwind.config';
import { defaultConfig } from '@/state/types';
describe('設計與展示設定契約', () => {
  it('所有基準字級符合最小 14px，包含 Canvas 圖形標籤', () => {
    for (const size of Object.values(designTokens.fontSize))
      expect(size).toBeGreaterThanOrEqual(14);
  });
  it('Tailwind 與 Canvas 使用同一份主色與圖形色票', () => {
    expect(tailwindConfig.theme.extend.colors).toBe(designTokens.colors);
    expect(tailwindConfig.theme.extend.colors.primary).toBe(designTokens.colors.primary);
  });
  it('預設為一萬節點，並保留可見範圍渲染', () => {
    expect(defaultConfig.count).toBe(10000);
    expect(defaultConfig.culling).toBe(true);
  });
});
