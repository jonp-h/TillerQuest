"use client";
import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

declare module "@mui/material/styles" {
  interface Palette {
    experience: Palette["primary"];
    mana: Palette["primary"];
    health: Palette["primary"];
  }

  interface PaletteOptions {
    experience?: PaletteOptions["primary"];
    mana?: PaletteOptions["primary"];
    health?: PaletteOptions["primary"];
    gold?: PaletteOptions["primary"];
    arenatoken?: PaletteOptions["primary"];
    gemstones?: PaletteOptions["primary"];
    tqwhite?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/LinearProgress" {
  interface LinearProgressPropsColorOverrides {
    experience: true;
    mana: true;
    health: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    experience: true;
    mana: true;
    health: true;
    gold: true;
    arenatoken: true;
    gemstones: true;
    tqwhite: true;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    experience: true;
    mana: true;
    health: true;
    gold: true;
    arenatoken: true;
    gemstones: true;
    tqwhite: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsColorOverrides {
    experience: true;
    mana: true;
    health: true;
    gold: true;
    arenatoken: true;
    gemstones: true;
  }
}

export const TillerQuestTheme = createTheme({
  palette: {
    // ------- text -------
    text: {
      primary: "#e2e2e2",
    },
    // ------- palette --------
    primary: {
      main: "#6E40C9",
      contrastText: "#e2e2e2",
    },
    secondary: {
      main: "#C06EFF",
      // main: "#8B5BFF", // higher contrast of primary color
      contrastText: "#0d1117",
    },
    error: {
      main: "#FF3B43",
      contrastText: "#0d1117",
    },
    success: {
      main: "#6EC348",
    },
    info: {
      main: "#3DBCEA",
      contrastText: "#0d1117",
    },
    warning: {
      main: "#FFA726",
      contrastText: "#0d1117",
    },
    background: {
      paper: "#0d1117",
    },
    // -------- custom colors ---------
    mode: "dark",
    experience: {
      main: "#f97316",
    },
    mana: {
      main: "#2196f3",
    },
    health: {
      main: "#f44336",
    },
    gold: {
      main: "#FFD700",
    },
    arenatoken: {
      main: "#FFA500",
    },
    gemstones: {
      main: "#00FFFF",
      contrastText: "#0d1117",
    },
    tqwhite: {
      main: "#e2e2e2",
      contrastText: "#0d1117",
    },
  },
  typography: {
    allVariants: {
      fontFamily: inter.style.fontFamily + ", sans-serif",
    },
  },
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: 5,
            height: 10,
            bgcolor: "#3f3f46", //TODO: change to a darker shade
          }),
        bar: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: "5",
          }),
      },
    },
  },
});
