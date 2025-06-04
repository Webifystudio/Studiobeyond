
export interface Theme {
  name: string;
  id: string;
  colors: {
    background: string; // HSL string e.g., "216 15% 15%"
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  fontFamilyBody?: string; // e.g., "'Roboto', sans-serif"
  fontFamilyHeadline?: string; // e.g., "'Audiowide', cursive"
  backgroundGradient?: string; // e.g., "linear-gradient(to bottom right, hsl(260 50% 5%), hsl(240 60% 15%))"
}

export const themes: Theme[] = [
  {
    name: "Default Dark",
    id: "default-dark",
    colors: {
      background: "216 15% 15%", // #1D232A
      foreground: "210 17% 75%", // #A0AEC0
      card: "215 20% 23%", // #2D3748
      cardForeground: "210 17% 75%",
      popover: "215 20% 23%",
      popoverForeground: "210 17% 75%",
      primary: "0 100% 71%", // #FF6B6B
      primaryForeground: "0 0% 100%",
      secondary: "215 15% 35%", // #4A5568
      secondaryForeground: "210 17% 75%",
      muted: "215 15% 30%",
      mutedForeground: "210 17% 55%",
      accent: "276 47% 73%", // #B19CD9
      accentForeground: "216 15% 15%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "215 15% 35%",
      input: "215 15% 35%",
      ring: "0 100% 71%",
    },
    fontFamilyBody: "'Inter', sans-serif",
    fontFamilyHeadline: "'Inter', sans-serif",
  },
  {
    name: "Light Mode",
    id: "light-mode",
    colors: {
      background: "0 0% 98%", // #FAFAFA
      foreground: "222.2 84% 4.9%", // #0C0A09
      card: "0 0% 100%", // #FFFFFF
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "262.1 83.3% 57.8%", // #7C3AED
      primaryForeground: "0 0% 98%", // #FAFAFA
      secondary: "0 0% 96.1%", // #F5F5F5
      secondaryForeground: "222.2 47.4% 11.2%", // #1C1917
      muted: "0 0% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%", // #78716C
      accent: "32 95% 60%", // Orange accent
      accentForeground: "20 80% 15%", // Dark Brown/Black for text on orange
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%", // #E5E5E5
      input: "0 0% 89.8%",
      ring: "262.1 83.3% 57.8%",
    },
    fontFamilyBody: "'Open Sans', sans-serif",
    fontFamilyHeadline: "'Raleway', sans-serif",
  },
  {
    name: "Cyberpunk Glow",
    id: "cyberpunk-glow",
    colors: {
      background: "260 30% 8%", 
      foreground: "180 100% 85%",
      card: "260 30% 12%",
      cardForeground: "180 100% 85%",
      popover: "260 30% 12%",
      popoverForeground: "180 100% 85%",
      primary: "320 100% 60%", // Hot Pink
      primaryForeground: "0 0% 100%",
      secondary: "260 25% 20%",
      secondaryForeground: "180 100% 85%",
      muted: "260 25% 15%",
      mutedForeground: "180 80% 60%",
      accent: "60 100% 55%", // Bright Yellow
      accentForeground: "260 30% 5%",
      destructive: "0 100% 55%",
      destructiveForeground: "0 0% 100%",
      border: "260 20% 25%",
      input: "260 20% 25%",
      ring: "320 100% 60%",
    },
    fontFamilyBody: "'Roboto Mono', monospace",
    fontFamilyHeadline: "'Audiowide', cursive",
    backgroundGradient: "linear-gradient(135deg, hsl(260 50% 10%), hsl(230 40% 5%))",
  },
  {
    name: "Sakura Dream",
    id: "sakura-dream",
    colors: {
      background: "340 100% 98%",
      foreground: "330 30% 30%",
      card: "0 0% 100%",
      cardForeground: "330 30% 30%",
      popover: "0 0% 100%",
      popoverForeground: "330 30% 30%",
      primary: "340 90% 70%", // Cherry Blossom Pink
      primaryForeground: "330 30% 20%",
      secondary: "340 80% 92%",
      secondaryForeground: "330 30% 40%",
      muted: "340 70% 90%",
      mutedForeground: "330 25% 50%",
      accent: "40 100% 75%", // Pale Gold
      accentForeground: "30 50% 25%",
      destructive: "0 80% 65%",
      destructiveForeground: "0 0% 100%",
      border: "340 60% 88%",
      input: "340 60% 88%",
      ring: "340 90% 70%",
    },
    fontFamilyBody: "'Noto Serif JP', serif",
    fontFamilyHeadline: "'Dancing Script', cursive",
    backgroundGradient: "radial-gradient(ellipse at top left, hsl(340 100% 97%), hsl(0 0% 100%))",
  },
  {
    name: "Oceanic Depths",
    id: "oceanic-depths", // Was oceanic-blue
    colors: {
      background: "205 60% 12%", // Darker Blue
      foreground: "190 25% 90%", // Lighter Cyan/Gray
      card: "205 50% 18%",
      cardForeground: "190 25% 90%",
      popover: "205 50% 18%",
      popoverForeground: "190 25% 90%",
      primary: "180 100% 40%", // Teal
      primaryForeground: "0 0% 100%",
      secondary: "205 40% 28%",
      secondaryForeground: "190 25% 90%",
      muted: "205 40% 22%",
      mutedForeground: "190 20% 70%",
      accent: "170 100% 50%", // Bright Sea Green
      accentForeground: "205 60% 8%",
      destructive: "0 70% 55%",
      destructiveForeground: "0 0% 100%",
      border: "205 40% 28%",
      input: "205 40% 28%",
      ring: "180 100% 40%",
    },
    fontFamilyBody: "'Open Sans', sans-serif",
    fontFamilyHeadline: "'Raleway', sans-serif",
    backgroundGradient: "linear-gradient(to bottom, hsl(205 60% 8%), hsl(210 70% 15%))",
  },
  {
    name: "Forest Whisper",
    id: "forest-whisper", // Was forest-green
    colors: {
      background: "120 30% 10%", // Darker Forest Green
      foreground: "90 15% 85%", // Light Moss Green
      card: "120 25% 15%",
      cardForeground: "90 15% 85%",
      popover: "120 25% 15%",
      popoverForeground: "90 15% 85%",
      primary: "90 65% 40%", // Rich Leaf Green
      primaryForeground: "0 0% 100%",
      secondary: "120 20% 25%",
      secondaryForeground: "90 15% 85%",
      muted: "120 20% 20%",
      mutedForeground: "90 10% 65%",
      accent: "45 75% 55%", // Goldenrod
      accentForeground: "120 30% 5%",
      destructive: "15 70% 50%",
      destructiveForeground: "0 0% 100%",
      border: "120 20% 25%",
      input: "120 20% 25%",
      ring: "90 65% 40%",
    },
    fontFamilyBody: "'Lato', sans-serif",
    fontFamilyHeadline: "'Merriweather', serif",
  },
  {
    name: "Crimson Night",
    id: "crimson-night",
    colors: {
      background: "0 10% 8%",
      foreground: "0 5% 80%",
      card: "0 10% 12%",
      cardForeground: "0 5% 80%",
      popover: "0 10% 12%",
      popoverForeground: "0 5% 80%",
      primary: "0 70% 50%", // Deep Crimson
      primaryForeground: "0 0% 100%",
      secondary: "0 8% 20%",
      secondaryForeground: "0 5% 80%",
      muted: "0 8% 15%",
      mutedForeground: "0 5% 60%",
      accent: "30 80% 55%", // Dark Orange
      accentForeground: "0 0% 100%",
      destructive: "0 70% 50%",
      destructiveForeground: "0 0% 100%",
      border: "0 8% 20%",
      input: "0 8% 20%",
      ring: "0 70% 50%",
    },
    fontFamilyBody: "'Inter', sans-serif",
    fontFamilyHeadline: "'Cinzel', serif", // Needs to be added to layout
  },
  {
    name: "Monochrome Cool",
    id: "monochrome-cool",
    colors: {
      background: "210 10% 96%",
      foreground: "220 10% 20%",
      card: "0 0% 100%",
      cardForeground: "220 10% 20%",
      popover: "0 0% 100%",
      popoverForeground: "220 10% 20%",
      primary: "220 20% 40%", // Cool Grey-Blue
      primaryForeground: "0 0% 100%",
      secondary: "210 10% 90%",
      secondaryForeground: "220 10% 30%",
      muted: "210 10% 85%",
      mutedForeground: "220 10% 50%",
      accent: "200 30% 50%", // Slightly brighter blue
      accentForeground: "0 0% 100%",
      destructive: "0 60% 50%",
      destructiveForeground: "0 0% 100%",
      border: "210 10% 85%",
      input: "210 10% 85%",
      ring: "220 20% 40%",
    },
    fontFamilyBody: "'Inter', sans-serif",
    fontFamilyHeadline: "'Inter', sans-serif",
  },
];

// Function to convert HSL string to HSL object for easier manipulation if needed
export const parseHsl = (hslStr: string): { h: number, s: number, l: number } | null => {
  const match = hslStr.match(/(\d+)\s*(\d+)%\s*(\d+)%/);
  if (match) {
    return {
      h: parseInt(match[1], 10),
      s: parseInt(match[2], 10),
      l: parseInt(match[3], 10),
    };
  }
  return null;
};

    