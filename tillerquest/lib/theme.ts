"use client";
import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";
// import { Roboto } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

//TODO: Could possible use Roboto to decrease bundle size
// const roboto = Roboto({
//   weight: ["300", "400", "500", "700"],
//   subsets: ["latin"],
//   display: "swap",
// });

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
  }
}

declare module "@mui/material/LinearProgress" {
  interface LinearProgressPropsColorOverrides {
    experience: true;
    mana: true;
    health: true;
  }
}

export const TillerQuestTheme = createTheme({
  palette: {
    mode: "dark",
    //orange
    experience: {
      // dark orange
      main: "#f97316",
    },
    // blue
    mana: {
      main: "#2196f3",
    },
    health: {
      main: "#f44336",
    },
  },
  typography: {
    allVariants: {
      fontFamily: inter.style.fontFamily + ", sans-serif",
      // inter.style.fontFamily + "," + roboto.style.fontFamily + ", sans-serif",
    },
  },
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: 5,
            height: 10,
            bgcolor: "grey.800",
          }),
        bar: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: "5",
          }),
      },
    },
  },
});
