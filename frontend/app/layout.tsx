import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { TillerQuestTheme } from "@/lib/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "TillerQuest: A gamified classroom experience",
  description: "A gamified classroom experience",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
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
