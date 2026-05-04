"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "@/components/MainContainer";
import { authClient } from "@/lib/auth-client";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { Devices } from "@mui/icons-material";

export default function DeviceAuthorizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatUserCode = (value: string) => {
    // Remove non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    // Add dash after 4 characters (e.g., ABCD-1234)
    if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + "-" + cleaned.slice(4, 8);
    }
    return cleaned;
  };

  const search = searchParams.get("user_code");
  const [userCode, setUserCode] = useState(
    search ? formatUserCode(search) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Format the code: remove dashes and spaces, convert to uppercase
      const formattedCode = userCode.trim().replace(/[-\s]/g, "").toUpperCase();

      if (formattedCode.length !== 8) {
        setError("Code must be 8 characters");
        setLoading(false);
        return;
      }

      // Verify the code exists
      const { data, error: verifyError } = await authClient.device({
        query: { user_code: formattedCode },
      });

      if (verifyError || !data) {
        setError("Invalid or expired code");
        setLoading(false);
        return;
      }

      // Redirect to approval page
      router.push(
        `/auth/device-authorization/approve?user_code=${formattedCode}`,
      );
    } catch (err) {
      console.error("Device auth error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <div className="flex justify-center lg:pt-10">
        <Paper
          elevation={3}
          className="flex flex-col justify-center p-8 w-full h-screen lg:h-auto lg:w-1/2 xl:w-1/3"
        >
          <div className="flex flex-col gap-6">
            <Devices
              sx={{
                fontSize: "4rem",
                margin: "auto",
                color: "primary.main",
              }}
            />
            <Typography variant="h4" component="h1" align="center">
              Device Authorization
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              Enter the code displayed on your device to authorize it.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Device Code"
                  placeholder="ABCD-1234"
                  value={userCode}
                  onChange={(e) => setUserCode(formatUserCode(e.target.value))}
                  fullWidth
                  inputProps={{
                    maxLength: 9, // 8 chars + 1 dash
                    style: {
                      fontSize: "1.5rem",
                      textAlign: "center",
                      letterSpacing: "0.2em",
                      fontFamily: "monospace",
                    },
                  }}
                  autoFocus
                  autoComplete="off"
                  error={!!error}
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    loading || userCode.replace(/[-\s]/g, "").length !== 8
                  }
                  fullWidth
                >
                  {loading ? "Verifying..." : "Continue"}
                </Button>
              </Box>
            </form>

            <Typography variant="caption" color="textSecondary" align="center">
              Device codes expire after 30 minutes
            </Typography>
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
