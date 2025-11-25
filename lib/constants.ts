// Animation Durations
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8
} as const;

// Easing Functions
export const EASING = {
  smooth: [0.22, 1, 0.36, 1],
  spring: [0.68, -0.55, 0.265, 1.55],
  bounce: [0.68, -0.6, 0.32, 1.6],
  ease: [0.4, 0, 0.2, 1]
} as const;

// Gradient Presets
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  purple: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  pink: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  ocean: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  sunset: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  forest: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
  tooltip: 60
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316'
} as const;

// Transaction Categories Colors
export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Housing: '#3b82f6',
  Transport: '#06b6d4',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Health: '#10b981',
  Utilities: '#f59e0b',
  Income: '#22c55e',
  Misc: '#64748b'
};

// Status Colors
export const STATUS_COLORS = {
  excellent: { from: '#10b981', to: '#059669' },
  good: { from: '#3b82f6', to: '#2563eb' },
  fair: { from: '#f59e0b', to: '#d97706' },
  poor: { from: '#ef4444', to: '#dc2626' }
} as const;
