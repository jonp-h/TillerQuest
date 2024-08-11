"use client";
import MainContainer from "@/components/MainContainer";
import { GitHub } from "@mui/icons-material";
import { IconButton, Paper, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import React from "react";

export default function SignUpPage() {
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
                ":hover": { cursor: "pointer" },
              }}
              onClick={() => signIn("github", { callbackUrl: "/" })}
            />
          </div>
          <div className="flex flex-col gap-16">
            <Typography variant="h5" align="center">
              Use your GitHub account to sign up
            </Typography>
            <Typography variant="body2" align="center">
              TillerQuest uses OAuth to confirm your identity through other
              services. When you log in, you only ever give your credentials to
              that service - never to TillerQuest. Then, the service you use
              tells the TillerQuest servers that you&apos;re really you. In
              general, this reveals no information about you beyond what is
              already public; here is an example from GitHub {""}
              <a
                className="text-blue-500"
                href="https://api.github.com/users/octocat"
                target="_blank"
              >
                (https://api.github.com/users/octocat)
              </a>
              .<br /> TillerQuest will remember your unique ID, names, URL, and
              image from the service you use to authenticate.
            </Typography>
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
