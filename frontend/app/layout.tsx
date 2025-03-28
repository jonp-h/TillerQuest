import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { TillerQuestTheme } from "@/lib/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import { Inter, Julius_Sans_One } from "next/font/google";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "TillerQuest",
  description: "A gamified classrom experience",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const julius_sans_one = Julius_Sans_One({
  weight: "400",
  variable: "--font-julius-sans-one",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${julius_sans_one.variable}`}>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={TillerQuestTheme}>
            <Navbar />
            <ToastContainer theme="dark" position="bottom-right" />
            {children}
            <Footer />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
