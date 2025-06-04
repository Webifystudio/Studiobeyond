
export interface Theme {
  name: string;
  id: string;
  colors: {
    background: string;
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
      accent: "262.1 83.3% 57.8%", // Similar to primary for this theme
      accentForeground: "0 0% 98%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%", // #E5E5E5
      input: "0 0% 89.8%",
      ring: "262.1 83.3% 57.8%",
    },
  },
  {
    name: "Oceanic Blue",
    id: "oceanic-blue",
    colors: {
      background: "205 50% 18%", // Dark Blue
      foreground: "200 15% 85%", // Light Cyan/Gray
      card: "205 45% 25%",
      cardForeground: "200 15% 85%",
      popover: "205 45% 25%",
      popoverForeground: "200 15% 85%",
      primary: "180 100% 35%", // Teal
      primaryForeground: "0 0% 100%",
      secondary: "205 30% 40%",
      secondaryForeground: "200 15% 85%",
      muted: "205 30% 30%",
      mutedForeground: "200 15% 65%",
      accent: "190 100% 50%", // Bright Cyan
      accentForeground: "205 50% 10%",
      destructive: "0 70% 50%",
      destructiveForeground: "0 0% 100%",
      border: "205 30% 40%",
      input: "205 30% 40%",
      ring: "180 100% 35%",
    },
  },
  {
    name: "Forest Green",
    id: "forest-green",
    colors: {
      background: "120 25% 15%", // Dark Green
      foreground: "100 10% 80%", // Light Beige
      card: "120 20% 22%",
      cardForeground: "100 10% 80%",
      popover: "120 20% 22%",
      popoverForeground: "100 10% 80%",
      primary: "90 60% 45%", // Olive Green
      primaryForeground: "0 0% 100%",
      secondary: "120 15% 35%",
      secondaryForeground: "100 10% 80%",
      muted: "120 15% 30%",
      mutedForeground: "100 10% 60%",
      accent: "70 70% 55%", // Brighter Yellow-Green
      accentForeground: "120 25% 10%",
      destructive: "0 60% 50%",
      destructiveForeground: "0 0% 100%",
      border: "120 15% 35%",
      input: "120 15% 35%",
      ring: "90 60% 45%",
    },
  },
];
