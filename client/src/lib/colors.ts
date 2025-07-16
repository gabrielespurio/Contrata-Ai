// Configuração centralizada de cores do sistema
export const colors = {
  primary: '#D14900',
  primaryHsl: 'hsl(16, 100%, 41%)',
  primaryHover: 'hsl(16, 100%, 36%)',
  
  secondary: '#4ade80',
  secondaryHsl: 'hsl(142, 76%, 36%)',
  
  accent: '#fbbf24',
  accentHsl: 'hsl(37, 92%, 50%)',
  
  destructive: '#ef4444',
  destructiveHsl: 'hsl(0, 84%, 60%)',
  
  // Variações da cor primária
  primaryLight: '#FF6B2B',
  primaryLighter: '#FFF4F0',
  primaryDark: '#A13700',
  
  // Cores de texto
  textPrimary: '#D14900',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // Cores de fundo
  backgroundPrimary: '#D14900',
  backgroundSecondary: '#F3F4F6',
  backgroundMuted: '#F9FAFB',
} as const;

// Tipos para garantir type safety
export type ColorKeys = keyof typeof colors;

// Função helper para obter cores
export const getColor = (key: ColorKeys): string => colors[key];

// Função para obter cor primária em diferentes formatos
export const getPrimaryColor = (format: 'hex' | 'hsl' | 'hover' = 'hex'): string => {
  switch (format) {
    case 'hex':
      return colors.primary;
    case 'hsl':
      return colors.primaryHsl;
    case 'hover':
      return colors.primaryHover;
    default:
      return colors.primary;
  }
};

// Constantes CSS personalizadas que podem ser utilizadas em componentes
export const cssVars = {
  '--primary-color': colors.primary,
  '--primary-hsl': colors.primaryHsl,
  '--primary-hover': colors.primaryHover,
  '--primary-light': colors.primaryLight,
  '--primary-lighter': colors.primaryLighter,
  '--primary-dark': colors.primaryDark,
} as const;