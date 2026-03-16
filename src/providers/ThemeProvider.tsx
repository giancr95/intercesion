import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// ─── Liturgical Seasons ───
export type LiturgicalSeason =
  | "ordinary"
  | "lent"
  | "advent"
  | "christmas"
  | "easter";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  muted: string;
  accent: string;
  fabBg: string;
  fabPressed: string;
  inputBg: string;
  chipBg: string;
  chipBgActive: string;
  modalOverlay: string;
  shadow: string;
  statusBar: "dark" | "light";
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  headerBg: string;
  headerText: string;
  // Category badge colors stay per-category, but we expose fallback
  badgeMutedBg: string;
  badgeMutedText: string;
  // Sign out / destructive
  danger: string;
  dangerPressed: string;
  // Candle
  candleColor: string;
  candleBg: string;
}

export interface LiturgicalTheme {
  key: LiturgicalSeason;
  label: string;
  emoji: string;
  description: string;
  colors: ThemeColors;
}

// ─── Color Palettes ───

const ordinaryColors: ThemeColors = {
  primary: "#5a7247",
  primaryDark: "#4a6239",
  background: "#f5f7f0",
  card: "#ffffff",
  text: "#2d3a24",
  textSecondary: "#5f7282",
  border: "#d4ddc8",
  muted: "#8a9a7c",
  accent: "#5a7247",
  fabBg: "#3d5a2e",
  fabPressed: "#2d4a20",
  inputBg: "#f5f7f0",
  chipBg: "#e8f0e3",
  chipBgActive: "#5a724720",
  modalOverlay: "rgba(0,0,0,0.35)",
  shadow: "#5a7247",
  statusBar: "dark",
  tabBarBg: "#f5f7f0",
  tabBarBorder: "#d4ddc8",
  tabBarActive: "#5a7247",
  tabBarInactive: "#8a9a7c",
  headerBg: "#f5f7f0",
  headerText: "#2d3a24",
  badgeMutedBg: "#f5f7f0",
  badgeMutedText: "#8a9a7c",
  danger: "#dc2626",
  dangerPressed: "#b91c1c",
  candleColor: "#f59e0b",
  candleBg: "#fef3c7",
};

const lentColors: ThemeColors = {
  primary: "#6b21a8",
  primaryDark: "#581c87",
  background: "#faf5ff",
  card: "#ffffff",
  text: "#3b0764",
  textSecondary: "#7e5bab",
  border: "#e9d5ff",
  muted: "#a78bca",
  accent: "#7c3aed",
  fabBg: "#581c87",
  fabPressed: "#4a1772",
  inputBg: "#faf5ff",
  chipBg: "#f3e8ff",
  chipBgActive: "#7c3aed20",
  modalOverlay: "rgba(30,0,50,0.4)",
  shadow: "#6b21a8",
  statusBar: "dark",
  tabBarBg: "#faf5ff",
  tabBarBorder: "#e9d5ff",
  tabBarActive: "#6b21a8",
  tabBarInactive: "#a78bca",
  headerBg: "#faf5ff",
  headerText: "#3b0764",
  badgeMutedBg: "#f3e8ff",
  badgeMutedText: "#a78bca",
  danger: "#dc2626",
  dangerPressed: "#b91c1c",
  candleColor: "#f59e0b",
  candleBg: "#fef3c7",
};

const adventColors: ThemeColors = {
  primary: "#1e3a8a",
  primaryDark: "#172e6e",
  background: "#eff6ff",
  card: "#ffffff",
  text: "#1e1b4b",
  textSecondary: "#6366f1",
  border: "#c7d2fe",
  muted: "#818cf8",
  accent: "#3b82f6",
  fabBg: "#172e6e",
  fabPressed: "#0f215a",
  inputBg: "#eff6ff",
  chipBg: "#e0e7ff",
  chipBgActive: "#3b82f620",
  modalOverlay: "rgba(0,10,40,0.4)",
  shadow: "#1e3a8a",
  statusBar: "dark",
  tabBarBg: "#eff6ff",
  tabBarBorder: "#c7d2fe",
  tabBarActive: "#1e3a8a",
  tabBarInactive: "#818cf8",
  headerBg: "#eff6ff",
  headerText: "#1e1b4b",
  badgeMutedBg: "#e0e7ff",
  badgeMutedText: "#818cf8",
  danger: "#dc2626",
  dangerPressed: "#b91c1c",
  candleColor: "#f59e0b",
  candleBg: "#fef3c7",
};

const christmasColors: ThemeColors = {
  primary: "#b45309",
  primaryDark: "#92400e",
  background: "#fffbeb",
  card: "#ffffff",
  text: "#78350f",
  textSecondary: "#b45309",
  border: "#fde68a",
  muted: "#d97706",
  accent: "#f59e0b",
  fabBg: "#92400e",
  fabPressed: "#78350f",
  inputBg: "#fffbeb",
  chipBg: "#fef3c7",
  chipBgActive: "#f59e0b20",
  modalOverlay: "rgba(40,20,0,0.4)",
  shadow: "#b45309",
  statusBar: "dark",
  tabBarBg: "#fffbeb",
  tabBarBorder: "#fde68a",
  tabBarActive: "#b45309",
  tabBarInactive: "#d97706",
  headerBg: "#fffbeb",
  headerText: "#78350f",
  badgeMutedBg: "#fef3c7",
  badgeMutedText: "#d97706",
  danger: "#dc2626",
  dangerPressed: "#b91c1c",
  candleColor: "#f59e0b",
  candleBg: "#fef3c7",
};

const easterColors: ThemeColors = {
  primary: "#ca8a04",
  primaryDark: "#a16207",
  background: "#fefce8",
  card: "#ffffff",
  text: "#422006",
  textSecondary: "#a16207",
  border: "#fde047",
  muted: "#ca8a04",
  accent: "#eab308",
  fabBg: "#a16207",
  fabPressed: "#854d0e",
  inputBg: "#fefce8",
  chipBg: "#fef9c3",
  chipBgActive: "#eab30820",
  modalOverlay: "rgba(40,30,0,0.35)",
  shadow: "#ca8a04",
  statusBar: "dark",
  tabBarBg: "#fefce8",
  tabBarBorder: "#fde047",
  tabBarActive: "#ca8a04",
  tabBarInactive: "#d97706",
  headerBg: "#fefce8",
  headerText: "#422006",
  badgeMutedBg: "#fef9c3",
  badgeMutedText: "#ca8a04",
  danger: "#dc2626",
  dangerPressed: "#b91c1c",
  candleColor: "#f59e0b",
  candleBg: "#fef3c7",
};

// ─── Theme Registry ───
export const THEMES: Record<LiturgicalSeason, LiturgicalTheme> = {
  ordinary: {
    key: "ordinary",
    label: "Tiempo Ordinario",
    emoji: "🌿",
    description: "Verde — crecimiento y esperanza",
    colors: ordinaryColors,
  },
  lent: {
    key: "lent",
    label: "Cuaresma",
    emoji: "✝️",
    description: "Morado — penitencia y conversión",
    colors: lentColors,
  },
  advent: {
    key: "advent",
    label: "Adviento",
    emoji: "🕯️",
    description: "Azul — esperanza y preparación",
    colors: adventColors,
  },
  christmas: {
    key: "christmas",
    label: "Navidad",
    emoji: "⭐",
    description: "Dorado — alegría y gloria",
    colors: christmasColors,
  },
  easter: {
    key: "easter",
    label: "Pascua",
    emoji: "🕊️",
    description: "Blanco y oro — resurrección y triunfo",
    colors: easterColors,
  },
};

// ─── Auto-detect Liturgical Season ───
// Simplified approximation based on typical liturgical calendar
function detectLiturgicalSeason(): LiturgicalSeason {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // Christmas: Dec 25 – Jan 6
  if ((month === 11 && day >= 25) || (month === 0 && day <= 6)) {
    return "christmas";
  }

  // Lent: approx Feb 14 – Mar 31 (varies by year, rough approximation)
  // More precisely we'd calculate Easter, but this is a good default
  if ((month === 1 && day >= 14) || month === 2 || (month === 3 && day <= 9)) {
    return "lent";
  }

  // Easter: approx Apr 10 – May 28 (varies)
  if ((month === 3 && day >= 10) || month === 4 || (month === 5 && day <= 4)) {
    return "easter";
  }

  // Advent: Nov 27 – Dec 24
  if ((month === 10 && day >= 27) || (month === 11 && day < 25)) {
    return "advent";
  }

  // Everything else is Ordinary Time
  return "ordinary";
}

// ─── Context ───
interface ThemeContextType {
  season: LiturgicalSeason;
  theme: LiturgicalTheme;
  colors: ThemeColors;
  setSeason: (season: LiturgicalSeason) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  season: "ordinary",
  theme: THEMES.ordinary,
  colors: ordinaryColors,
  setSeason: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_STORAGE_KEY = "intercesion_liturgical_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<LiturgicalSeason>(
    detectLiturgicalSeason()
  );
  const [loaded, setLoaded] = useState(false);

  // Load persisted theme
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored && THEMES[stored as LiturgicalSeason]) {
        setSeasonState(stored as LiturgicalSeason);
      }
      setLoaded(true);
    });
  }, []);

  const setSeason = (newSeason: LiturgicalSeason) => {
    setSeasonState(newSeason);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newSeason);
  };

  const theme = THEMES[season];

  // Don't render until we've loaded the stored theme to prevent flash
  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{ season, theme, colors: theme.colors, setSeason }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
