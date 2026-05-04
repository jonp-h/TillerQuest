"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "@/components/MainContainer";
import { Paper, Typography } from "@mui/material";
import { Cancel } from "@mui/icons-material";

export default function DeviceDeniedPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <MainContainer>
      <div className="flex justify-center lg:pt-10">
        <Paper
          elevation={3}
          className="flex flex-col justify-center p-8 w-full h-screen lg:h-auto lg:w-1/2 xl:w-1/3"
        >
          <div className="flex flex-col gap-6 items-center">
            <Cancel
              sx={{
                fontSize: "6rem",
                color: "error.main",
              }}
            />
            <Typography variant="h4" component="h1" align="center">
              Device Denied
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              The device authorization was denied.
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Redirecting to home...
            </Typography>
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
