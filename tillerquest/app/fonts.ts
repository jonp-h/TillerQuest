import { Inter, Julius_Sans_One } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
});

export const julius_Sans_One = Julius_Sans_One({
  subsets: ["latin"],
  weight: ["400"],
});

// Optional dyslexic font, should be implemented to trigger on user request
export const dyslexic = localFont({
  src: "./OpenDyslexic-Regular.otf",
  display: "swap",
});
