// TODO: double check if use client is good for use in layout

import type { Metadata } from "next";
import { inter } from "./fonts";
import "@/styles/globals.css";
import NavBar from "../components/ui/NavBar";
import Footer from "../components/ui/Footer";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

// export const metadata: Metadata = {
//   title: "Tiller Quest",
//   description: "Tiller Quest: A gamified classroom experience",
// };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [chosenFont, setChosenFont] = useState(inter.className);

  // const switchFont = () => {
  //   setChosenFont(
  //     chosenFont === inter.className ? dyslexic.className : inter.className
  //   );
  // };

  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={cn(inter.className)}>
          <NavBar />
          {children}
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
}
