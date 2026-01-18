"use client";
import MainContainer from "@/components/MainContainer";
import { signIn } from "@/lib/auth-client";
import { GitHub } from "@mui/icons-material";
import { Box, Button, Link, Paper, Typography } from "@mui/material";

export default function SignUpPage() {
  // TODO: consider redirecting if logged in

  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return (
    <MainContainer>
      <div className="flex justify-center lg:pt-10">
        <Paper
          elevation={3}
          className="flex flex-col justify-center p-5 w-full h-screen lg:h-auto lg:w-1/2 xl:w-1/3"
        >
          <div className="flex flex-col gap-5">
            <Typography variant="h3" component={"h1"} align="center">
              Sign Up
            </Typography>
            <GitHub
              sx={{
                fontSize: "6rem",
                margin: "auto",
              }}
              onClick={() =>
                signIn.social({
                  provider: "github",
                  callbackURL: frontendUrl,
                })
              }
            />
          </div>
          <div className="flex flex-col gap-5">
            <Typography variant="h5" component={"h2"} align="center">
              Use your GitHub account to sign up
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              TillerQuest uses OAuth to confirm your identity through other
              services. When you log in,
              <Box
                component="span"
                color="info.main"
                fontWeight="fontWeightBold"
              >
                {" "}
                you only ever give your credentials to that service - never to
                TillerQuest
              </Box>
              . Then, the GitHub service tells the TillerQuest servers that
              you&apos;re really you.
              <br />
              <br />
              In general,{" "}
              <Box component="span" color="error.main" fontWeight="800">
                this reveals no information about you beyond what is already
                public.
              </Box>{" "}
              Here is an example from GitHub: {""}
              <Link
                underline="hover"
                color="info"
                href="https://api.github.com/users/octocat"
                target="_blank"
              >
                api.github.com/users/octocat
              </Link>
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                signIn.social({
                  provider: "github",
                  callbackURL: frontendUrl,
                })
              }
            >
              Sign up
            </Button>
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
