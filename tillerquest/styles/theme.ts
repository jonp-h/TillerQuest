// src/theme.ts
"use client";
import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#591c87", // main purple 900
    },
    background: {
      default: "#0f172a",
      paper: "#0f172a",
    },
    secondary: {
      // main: "#c26ec6", // lighter purple
      main: "#5E9B25",
      // green
      // main: "#4a871c", // lighter
      // or darker: #246508
    },
    info: {
      main: "#fff",
    },
  },
});

export default theme;
