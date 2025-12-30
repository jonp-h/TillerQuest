"use client";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import { usePathname } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import StadiumIcon from "@mui/icons-material/Stadium";
import BoltIcon from "@mui/icons-material/Bolt";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import CasinoIcon from "@mui/icons-material/Casino";
import { IconButton } from "@mui/material";
import { AutoAwesome, Castle, Groups } from "@mui/icons-material";
import { signIn, signOut, useSession } from "@/lib/auth-client";

export default function NavbarContent() {
  const session = useSession();
  const pathname = usePathname();
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  if (!session) {
    return (
      <div className="flex items-center justify-between w-full">
        <Link href="/">
          <div className="flex items-center gap-5">
            <Image
              src="TillerQuestLogoHorizontal.svg"
              alt="TillerQuest"
              width={300}
              height={150}
            />
          </div>
        </Link>
      </div>
    );
  }

  const links = [
    {
      name: "Wishing Well",
      href: "/wishing-well",
      icon: <AutoAwesome />,
    },
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
      name: "Guild",
      href: "/guild",
      icon: <Groups />,
    },
    {
      name: "Dungeons",
      href: "/dungeons",
      icon: <Castle />,
    },
    {
      name: "Abilities",
      href: "/abilities",
      icon: <BoltIcon />,
    },
    {
      name: session.data?.user ? session.data.user.username : "Profile",
      href: "/profile/" + (session.data?.user?.username || ""),
      icon: <AccountCircleIcon />,
    },
  ];

  if (session.data?.user?.role === "ADMIN") {
    links.unshift({
      name: "Game Master",
      href: "/gamemaster",
      icon: <CasinoIcon />,
    });
  }

  return (
    <>
      <Link href="/">
        <div className="flex px-2 items-center">
          <div className="hidden md:flex">
            <Image
              src="/TillerQuestLogoHorizontal.svg"
              alt="TillerQuest"
              width={300}
              height={150}
            />
          </div>
          <div className="flex md:hidden">
            <Image
              src="/TQCircle.svg"
              alt="TillerQuest"
              width={70}
              height={70}
            />
          </div>
        </div>
      </Link>
      {/* On smaller screens only show icons */}
      <div className="flex justify-end gap-2 md:gap-8  w-full">
        {session.data?.user
          ? links.map((link) => (
              <Link href={link.href} key={link.name}>
                <Button
                  variant={pathname === link.href ? "outlined" : "text"}
                  color={pathname === link.href ? "secondary" : "tqwhite"}
                  startIcon={link.icon}
                  sx={{
                    display: { xs: "none", md: "none", lg: "flex" },
                    textWrap: "nowrap",
                  }}
                >
                  {link.name}
                </Button>
                <IconButton
                  sx={{ display: { xs: "block", md: "block", lg: "none" } }}
                  color={pathname === link.href ? "secondary" : "tqwhite"}
                  size="large"
                >
                  {link.icon}
                </IconButton>
              </Link>
            ))
          : null}
        {session.data?.user ? (
          <>
            <Button
              className="whitespace-nowrap"
              variant="outlined"
              color="tqwhite"
              startIcon={<LogoutIcon />}
              sx={{ display: { xs: "none", md: "none", lg: "flex" } }}
              onClick={() => signOut()}
            >
              Sign out
            </Button>
            <IconButton
              sx={{ display: { xs: "block", md: "block", lg: "none" } }}
              color="tqwhite"
              size="large"
              onClick={() => signOut()}
            >
              <LogoutIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              sx={{
                display: { xs: "none", md: "none", lg: "flex" },
              }}
              onClick={() =>
                signIn.social({ provider: "github", callbackURL: frontendUrl })
              }
            >
              Sign in
            </Button>
            <IconButton
              sx={{
                display: { xs: "flex", md: "flex", lg: "none" },
              }}
              color="primary"
              size="large"
              onClick={() =>
                signIn.social({ provider: "github", callbackURL: frontendUrl })
              }
            >
              <LoginIcon />
            </IconButton>
            <Link href={"/signup"}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                sx={{
                  display: { xs: "none", md: "none", lg: "flex" },
                }}
              >
                Sign up
              </Button>
              <IconButton
                sx={{ display: { xs: "flex", md: "flex", lg: "none" } }}
                color="primary"
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
