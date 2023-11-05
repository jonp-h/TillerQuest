import type { Metadata } from "next";
import { Julius_Sans_One } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import NavBar from "./ui/NavBar";
import Footer from "./ui/Footer";

// Optional dyslexic font, should be implemented to trigger on user request
// const dyslexic = localFont({
//   src: "./OpenDyslexic-Regular.otf",
//   display: "swap",
// });

const julius_Sans_One = Julius_Sans_One({
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Tiller Quest",
  description: "Tiller Quest: A gamified classroom experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={julius_Sans_One.className}>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
