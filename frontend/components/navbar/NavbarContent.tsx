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
import { Badge, IconButton } from "@mui/material";
import {
  Announcement,
  AutoAwesome,
  Castle,
  Groups,
  Work,
} from "@mui/icons-material";
import { signIn, signOut } from "@/lib/auth-client";
import { BackendSessionResponse } from "@/lib/redirectUtils";

export default function NavbarContent({
  scheduledWishesCount,
  scheduledAppEventsCount: scheduledAppEventsDate,
  session,
}: {
  scheduledWishesCount: number;
  scheduledAppEventsCount: Date | null;
  session: BackendSessionResponse | null;
}) {
  const pathname = usePathname();
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const workUrl = process.env.NEXT_PUBLIC_WORK_URL || null;

  // countdown in hours until next scheduled app event
  let nextAppEventCountdown = "";
  if (scheduledAppEventsDate) {
    const now = new Date();
    const eventDate = new Date(scheduledAppEventsDate);
    const diffInMs = eventDate.getTime() - now.getTime();

    if (diffInMs > 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

      if (diffInHours > 0) {
        nextAppEventCountdown = `${diffInHours}h`;
      } else {
        nextAppEventCountdown = `<1h`;
      }
    }
  }

  const handleSignIn = () => {
    signIn.social({ provider: "github", callbackURL: frontendUrl });
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Unauthenticated navbar
  if (!session?.user) {
    return (
      <div className="flex items-center justify-between w-full">
        <Link href="/">
          <Image
            src="/TillerQuestLogoHorizontal.svg"
            alt="TillerQuest"
            width={300}
            height={150}
          />
        </Link>
        <div className="flex justify-end gap-2 md:gap-8">
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            sx={{ display: { xs: "none", lg: "flex" } }}
            onClick={handleSignIn}
          >
            Sign in
          </Button>
          <IconButton
            sx={{ display: { xs: "flex", lg: "none" } }}
            color="primary"
            size="medium"
            onClick={handleSignIn}
            aria-label="Sign in"
          >
            <LoginIcon />
          </IconButton>

          <Link href="/signup">
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              sx={{ display: { xs: "none", lg: "flex" } }}
            >
              Sign up
            </Button>
            <IconButton
              sx={{ display: { xs: "flex", lg: "none" } }}
              color="primary"
              size="medium"
              aria-label="Sign up"
            >
              <PersonAddIcon />
            </IconButton>
          </Link>
        </div>
      </div>
    );
  }

  // Build navigation links for authenticated users
  const links = [
    {
      name: "Wishing Well",
      href: "/wishing-well",
      icon: <AutoAwesome />,
      badge: scheduledWishesCount,
    },
    {
      name: "Quest Board",
      href: "/quest-board",
      icon: <Announcement />,
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
      badge: nextAppEventCountdown ? nextAppEventCountdown : undefined,
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
      name: session.user.username,
      href: `/profile/${session.user.username}`,
      icon: <AccountCircleIcon />,
    },
  ];

  // Add work link if WORK_URL is set the environment variables
  if (workUrl) {
    links.unshift({
      name: "Work",
      href: workUrl,
      icon: <Work />,
    });
  }

  // Add admin link if user is admin
  if (session.user.role === "ADMIN") {
    links.unshift({
      name: "Game Master",
      href: "/gamemaster",
      icon: <CasinoIcon />,
      badge: undefined,
    });
  }

  // Authenticated navbar
  return (
    <>
      <Link href="/">
        <div className="flex px-2 items-center">
          <Image
            src="/TillerQuestLogoHorizontal.svg"
            alt="TillerQuest"
            width={250}
            height={150}
            className="hidden md:block"
          />
          <Image
            src="/TQCircle.svg"
            alt="TillerQuest"
            width={70}
            height={70}
            className="block md:hidden"
          />
        </div>
      </Link>

      <div className="flex justify-end gap-2 md:gap-4 w-full">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
          >
            <Badge
              badgeContent={link.badge}
              color="error"
              max={99}
              invisible={!link.badge}
            >
              <Button
                variant={pathname === link.href ? "outlined" : "text"}
                color={pathname === link.href ? "secondary" : "tqwhite"}
                startIcon={link.icon}
                sx={{
                  fontSize: 13,
                  display: { xs: "none", lg: "flex" },
                  textWrap: "nowrap",
                }}
              >
                {link.name}
              </Button>
              <IconButton
                sx={{ display: { xs: "block", lg: "none" } }}
                color={pathname === link.href ? "secondary" : "tqwhite"}
                size="medium"
                aria-label={link.name}
              >
                {link.icon}
              </IconButton>
            </Badge>
          </Link>
        ))}

        <Button
          variant="outlined"
          color="tqwhite"
          startIcon={<LogoutIcon />}
          sx={{
            display: { xs: "none", lg: "flex" },
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
          onClick={handleSignOut}
        >
          Sign out
        </Button>
        <IconButton
          sx={{ display: { xs: "block", lg: "none" } }}
          color="tqwhite"
          size="medium"
          onClick={handleSignOut}
          aria-label="Sign out"
        >
          <LogoutIcon />
        </IconButton>
      </div>
    </>
  );
}
