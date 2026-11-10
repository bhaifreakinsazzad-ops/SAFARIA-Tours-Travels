import designTokens from './design-tokens/DESIGN_TOKENS.json';

/**
 * Tailwind config that pulls color, spacing, radius, shadow, and font tokens
 * from the SAFARIA design token JSON.
 */
const config = {
  // Tailwind configuration generated from SAFARIA design tokens
  // Exported as a named constant to satisfy lint rules
  // See DESIGN_TOKENS.json for source values
  
  // content, theme, plugins etc.

  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette
        emerald: designTokens.color.tokens.find(t => t.name === 'emerald')?.value,
        navy:    designTokens.color.tokens.find(t => t.name === 'navy')?.value,
        gold:    designTokens.color.tokens.find(t => t.name === 'gold')?.value,
        ivory:   designTokens.color.tokens.find(t => t.name === 'ivory')?.value,
        // Surface tokens (mapped to utility names)
        ...Object.fromEntries(
          designTokens.color.tokens
            .filter(t => t.name.startsWith('surface-'))
            .map(t => [t.name.replace('surface-', 'sf-'), t.value])
        ),
      },
      spacing: Object.fromEntries(
        designTokens.spacing.tokens.map(t => [t.name.replace('space-', ''), t.value])
      ),
      borderRadius: Object.fromEntries(
        designTokens.radius.tokens.map(t => [t.name.replace('radius-', ''), t.value])
      ),
      boxShadow: Object.fromEntries(
        designTokens.shadow.tokens.map(t => [t.name.replace('shadow-', ''), t.value])
      ),
      fontFamily: {
        // Primary sans (Inter + Hind Siliguri + Noto Bengali)
        sans: ['Inter', '"Noto Sans Bengali"', '"Hind Siliguri"', 'system-ui', 'sans-serif'],
        // Display / heading font
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Bengali specific
        bengali: ['"Noto Sans Bengali"', '"Hind Siliguri"', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // Example mapping for a few token-defined sizes (you can extend as needed)
        'display-hero': ['84px', { lineHeight: 1.08, letterSpacing: '-0.035em' }],
        'display-section': ['58px', { lineHeight: 1.08, letterSpacing: '-0.035em' }],
        'display-dialog': ['36px', { lineHeight: 1.1, letterSpacing: '-0.02em' }],
        'display-card': ['27px', { lineHeight: 1.15 }],
        'brand-name': ['24px', { lineHeight: 1.1, fontWeight: '600', letterSpacing: '0.04em' }],
        // Body and button sizes
        'body': ['16px', { lineHeight: 1.65 }],
        'button': ['13px', { lineHeight: 1.5, fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
export default config;
