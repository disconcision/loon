export const themes = {
  dark: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    surfaceSelected: '#3d3d3d',
    text: '#e0e0e0',
    textDim: '#a0a0a0',
    border: '#404040',
    borderSelected: '#d0d0d0',
    human: '#2d2d2d',
    model: '#2d3440',
    system: '#2d3d3d',
    accent: '#4a9eff',
  },
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSelected: '#ffffff',
    text: '#000000',
    textDim: '#666666',
    border: '#cccccc',
    borderSelected: '#000000',
    human: '#f5f5f5',
    model: '#f0f7ff',
    system: '#f0f7f7',
    accent: '#0066cc',
  },
} as const;

export type Theme = typeof themes.dark;
export type ThemeColor = keyof Theme; 