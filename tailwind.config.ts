import type { Config } from 'tailwindcss';
import { designTokens } from './src/design/tokens';

/** Semantic primary, colors and typography are configured here for Tailwind utilities. */
export default {
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: designTokens.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(designTokens.fontSize).map(([name, size]) => [
          name,
          [`${size}px`, { lineHeight: '1.5' }],
        ]),
      ),
      fontWeight: designTokens.fontWeight,
    },
  },
} satisfies Config;
