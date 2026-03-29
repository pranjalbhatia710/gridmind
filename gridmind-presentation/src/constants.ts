// GridMind Presentation Constants
export const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d28",
  border: "#262a38",
  gold: "#daa520",
  green: "#27ae60",
  red: "#e74c3c",
  blue: "#3498db",
  purple: "#9b59b6",
  teal: "#1abc9c",
  orange: "#e67e22",
  text: "#c8c8d0",
  muted: "#6b6f80",
  bright: "#e8e8ee",
} as const;

export const COLORS_THREE = {
  bg: 0x0f1117,
  surface: 0x1a1d28,
  gold: 0xdaa520,
  green: 0x27ae60,
  red: 0xe74c3c,
  blue: 0x3498db,
  purple: 0x9b59b6,
  teal: 0x1abc9c,
  orange: 0xe67e22,
  white: 0xe8e8ee,
} as const;

// Case study data
export const CAMPUS = {
  buildings: 120,
  totalKwh: 210_000_000,
  annualCost: 28_000_000,
  budget: 12_000_000,
  meteredBuildings: 30,
  peakRate: 0.17,
  offPeakRate: 0.106,
  avgRate: 0.133,
  dailyKwh: 575_342,
  annualSavings: 7_350_000,
  paybackMonths: 22,
  irr: "45-55%",
  netSavings: 15_000_000,
  emissionsReduction: 0.4,
} as const;

export const BUILDING_DATA = [
  { type: "Research Labs", count: 20, avgKwh: 4_900_000, totalKwh: 98_000_000, pct: 46.7, color: COLORS.red },
  { type: "Academic", count: 60, avgKwh: 1_200_000, totalKwh: 72_000_000, pct: 34.3, color: COLORS.blue },
  { type: "Residence", count: 25, avgKwh: 1_800_000, totalKwh: 45_000_000, pct: 21.4, color: COLORS.teal },
  { type: "Athletic", count: 15, avgKwh: 2_500_000, totalKwh: 37_500_000, pct: 17.9, color: COLORS.purple },
] as const;

export const BASELINE_HOURLY = [
  8200, 7800, 7400, 7100, 6900, 7200,
  12000, 19000, 22000, 24000, 24500, 23800,
  23500, 24200, 24000, 23000, 21000, 17000,
  14000, 12500, 11500, 10500, 9800, 8800,
];

// Presentation timing (in frames at 30fps)
export const FPS = 30;
export const SCENE_DURATION = 300; // 10 seconds per scene
export const TRANSITION_DURATION = 30; // 1 second transitions
export const TOTAL_SCENES = 10;
export const TOTAL_DURATION = SCENE_DURATION * TOTAL_SCENES;
