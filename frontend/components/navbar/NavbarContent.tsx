"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import StorefrontIcon from "@mui/icons-material/Storefront";
import StadiumIcon from "@mui/icons-material/Stadium";
import BoltIcon from "@mui/icons-material/Bolt";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import CasinoIcon from "@mui/icons-material/Casino";
import { IconButton } from "@mui/material";

export default function NavbarContent() {
  const session = useSession();
  const [openMobileMenu, setOpenMobileMenu] = React.useState(false);
  const pathname = usePathname();

  const links = [
    {
      name: "Shop",
      href: "/shop",
      icon: <StorefrontIcon />,
    },
    {
      name: "Arena",
      href: "/arena",
      icon: <StadiumIcon />,
    },
    {
      name: "Abilities",
      href: "/abilities",
      icon: <BoltIcon />,
    },
    {
      name: session?.data ? session?.data.user.username : "Profile",
      href: "/profile/" + session?.data?.user.username,
      icon: <AccountCircleIcon />,
    },
  ];

  if (session.data?.user.role === "ADMIN") {
    links.unshift({
      name: "Game Master",
      href: "/gamemaster",
      icon: <CasinoIcon />,
    });
  }

  return (
    <>
      <Link href="/">
        <div className="flex items-center gap-5">
          <Image src="/TQlogo.png" alt="TillerQuest" width={70} height={70} />
          <h1 className={"hidden md:block text-2xl"}>TillerQuest</h1>
        </div>
      </Link>
      {/* On smaller screens only show icons */}
      <div className="flex justify-end gap-2 md:gap-8  w-full">
        {links.map((link) => (
          <Link href={link.href} key={link.name}>
            <Button
              variant={pathname === link.href ? "outlined" : "text"}
              color={pathname === link.href ? "primary" : "inherit"}
              startIcon={link.icon}
              sx={{ display: { xs: "none", md: "none", lg: "flex" } }}
            >
              {link.name}
            </Button>
            <IconButton
              sx={{ display: { xs: "block", md: "block", lg: "none" } }}
              color={pathname === link.href ? "primary" : "default"}
              size="large"
            >
              {link.icon}
            </IconButton>
          </Link>
        ))}
        <Button
          className="whitespace-nowrap"
          variant="contained"
          color="primary"
          startIcon={<ShieldIcon />}
          onClick={() => {
            const data = fetch("http://localhost:8080/users", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
            console.log(data);
          }}
        ></Button>

        {session.data ? (
          <>
            <Button
              className="whitespace-nowrap"
              variant="outlined"
              color="secondary"
              startIcon={<LogoutIcon />}
              sx={{ display: { xs: "none", md: "none", lg: "flex" } }}
              onClick={() => signOut()}
            >
              Sign out
            </Button>
            <IconButton
              sx={{ display: { xs: "block", md: "block", lg: "none" } }}
              color="secondary"
              size="large"
              onClick={() => signOut()}
            >
              <LogoutIcon />
            </IconButton>
          </>
        ) : (
          <>
            {/* <form
              action="http://localhost:8080/auth/signin/github"
              method="POST"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input
                type="hidden"
                name="redirectTo"
                value="http://localhost:3000"
              />
              <Button
                className="whitespace-nowrap"
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                sx={{ display: { xs: "none", md: "none", lg: "block" } }}
                type="submit"
              >
                Sign in
              </Button>
              <IconButton
                sx={{ display: { xs: "block", md: "block", lg: "none" } }}
                color="secondary"
                size="large"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <LoginIcon />
              </IconButton>
            </form> */}
            <Button
              className="whitespace-nowrap"
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              sx={{ display: { xs: "none", md: "none", lg: "block" } }}
              onClick={() =>
                signIn("github", {
                  redirectTo: "/",
                })
              }
            >
              Sign in
            </Button>
            <IconButton
              sx={{ display: { xs: "block", md: "block", lg: "none" } }}
              color="secondary"
              size="large"
              onClick={() =>
                signIn("github", {
                  redirectTo: "/",
                })
              }
            >
              <LoginIcon />
            </IconButton>
            <Link href={"/signup"}>
              <Button
                className="whitespace-nowrap"
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                sx={{ display: { xs: "none", md: "none", lg: "block" } }}
              >
                Sign up
              </Button>
              <IconButton
                sx={{ display: { xs: "block", md: "block", lg: "none" } }}
                color="secondary"
                size="large"
              >
                <PersonAddIcon />
              </IconButton>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
