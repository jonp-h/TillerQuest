import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import NavBar from "./ui/NavBar";
import Footer from "./ui/Footer";

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
      <body className={inter.className}>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
