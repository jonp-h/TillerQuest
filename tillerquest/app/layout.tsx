import type { Metadata } from "next";
import { Julius_Sans_One } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

// Optional dyslexic font, should be implemented to trigger on user request
const dyslexic = localFont({
  src: "./opendyslexic-regular.otf",
  display: "swap",
});

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
      <body className={julius_Sans_One.className}>{children}</body>
    </html>
  );
}
