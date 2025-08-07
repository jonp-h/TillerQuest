"use client";
import MainContainer from "@/components/MainContainer";
import { signIn, useSession } from "@/lib/auth-client";
import { GitHub } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { redirect } from "next/navigation";

import React from "react";

export default function SignUpPage() {
  // If the user is already signed in, redirect them to the home page
  const session = useSession();
  if (session) {
    redirect("/");
  }

  return (
    <MainContainer>
      <div className="flex justify-center lg:pt-10">
        <Paper
          elevation={6}
          className="flex flex-col justify-center p-5 w-full h-screen lg:h-auto lg:w-1/2 xl:w-1/3"
        >
          <div className="flex flex-col gap-5">
            <Typography variant="h3" align="center">
              Sign Up
            </Typography>
            <GitHub
              sx={{
                fontSize: "6rem",
                margin: "auto",
              }}
              onClick={() =>
                signIn.social({ provider: "github", callbackURL: "/" })
              }
            />
          </div>
          <div className="flex flex-col gap-5">
            <Typography variant="h5" align="center">
              Use your GitHub account to sign up
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              TillerQuest uses OAuth to confirm your identity through other
              services. When you log in,
              <strong>
                {" "}
                you only ever give your credentials to that service - never to
                TillerQuest
              </strong>
              . Then, the GitHub service tells the TillerQuest servers that
              you&apos;re really you.
              <br />
              <br /> In general, this reveals no information about you beyond
              what is already public. Here is an example from GitHub: {""}
              <a
                className="text-blue-500 hover:underline"
                href="https://api.github.com/users/octocat"
                target="_blank"
              >
                api.github.com/users/octocat
              </a>
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                signIn.social({ provider: "github", callbackURL: "/" })
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
