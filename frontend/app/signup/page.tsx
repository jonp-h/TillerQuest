"use client";
import MainContainer from "@/components/MainContainer";
import { signIn } from "@/lib/auth-client";
import {
  ArrowForward,
  EmailOutlined,
  GitHub,
  InfoOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import { Box, Button, Link, Paper, Stack, Typography } from "@mui/material";

export default function SignUpPage() {
  // TODO: consider redirecting if logged in

  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const continueWithGitHub = () =>
    signIn.social({
      provider: "github",
      callbackURL: frontendUrl,
    });

  return (
    <MainContainer>
      <div className="flex justify-center px-4 pb-16 pt-8 sm:px-6 lg:pt-16">
        <Paper
          elevation={3}
          className="w-full max-w-5xl overflow-hidden"
          sx={{
            border: "1px solid rgba(61, 188, 234, 0.2)",
            background:
              "linear-gradient(135deg, rgba(40, 24, 79, 0.96), rgba(13, 17, 23, 0.98) 55%)",
          }}
        >
          <Box className="p-6 sm:p-10">
            <Stack spacing={1.5} sx={{ maxWidth: 680 }}>
              <Typography
                variant="overline"
                color="info.main"
                sx={{ letterSpacing: "0.16em", fontWeight: 700 }}
              >
                Your first quest
              </Typography>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
                Create your TillerQuest account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                TillerQuest uses GitHub to confirm your identity. Here&apos;s
                what to know before you begin.
              </Typography>
            </Stack>

            <Stack spacing={2} sx={{ mt: 5 }}>
              <FlowStep
                number="01"
                icon={<GitHub />}
                title="You'll need a GitHub account"
              >
                GitHub is a service for uploading and downloading code
                repositories. It also acts a bit like a CV for developers, so
                you may use it beyond TillerQuest.
              </FlowStep>
              <FlowStep
                number="02"
                icon={<EmailOutlined />}
                title="Choose your email address"
              >
                You can use a personal email or your school-issued email. A
                school email may be convenient now, but remember that it will be
                deleted when you graduate.
              </FlowStep>
              <FlowStep
                number="03"
                icon={<SecurityOutlined />}
                title="Continue securely with GitHub"
              >
                You will enter your GitHub credentials on GitHub, never on
                TillerQuest. GitHub then tells TillerQuest that your identity
                has been confirmed.
              </FlowStep>
            </Stack>

            <Button
              fullWidth
              size="large"
              variant="contained"
              endIcon={<ArrowForward />}
              startIcon={<GitHub />}
              onClick={continueWithGitHub}
              sx={{ mt: 4, py: 1.5, fontWeight: 700 }}
            >
              Continue with GitHub
            </Button>
            <Button
              fullWidth
              size="large"
              variant="text"
              color="secondary"
              endIcon={<ArrowForward />}
              startIcon={<GitHub />}
              onClick={continueWithGitHub}
              sx={{ mt: 4, py: 1.5, fontWeight: 700 }}
            >
              Already have an account? Log in
            </Button>
            <Box
              sx={{
                alignItems: "flex-start",
                border: "1px solid rgba(61, 188, 234, 0.3)",
                borderRadius: 1,
                display: "flex",
                gap: 1.5,
                mt: 4,
                p: 2,
                bgcolor: "rgba(61, 188, 234, 0.08)",
              }}
            >
              <InfoOutlined color="info" sx={{ mt: 0.25 }} />
              <Stack spacing={0.75}>
                <Typography
                  variant="h6"
                  component="h3"
                  fontWeight={700}
                  color="text.primary"
                >
                  Info for nerds
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  TillerQuest uses OAuth to confirm your identity through other
                  services. When you log in, you only ever give your credentials
                  to that service, never to TillerQuest. Then, the GitHub
                  service tells the TillerQuest servers that you&apos;re really
                  you. In general, this reveals no information about you beyond
                  what is already public. You can see an example of what GitHub
                  shares in its{" "}
                  <Link
                    underline="hover"
                    color="info.main"
                    href="https://api.github.com/users/octocat"
                    target="_blank"
                    rel="noreferrer"
                  >
                    public API example
                  </Link>
                  .
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </div>
    </MainContainer>
  );
}

function FlowStep({
  number,
  icon,
  title,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "rgba(61, 188, 234, 0.12)",
          border: "1px solid rgba(61, 188, 234, 0.28)",
          borderRadius: 1,
          color: "info.main",
          display: "flex",
          flexShrink: 0,
          height: 48,
          justifyContent: "center",
          position: "relative",
          width: 48,
        }}
      >
        {icon}
        <Typography
          variant="caption"
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            bottom: -8,
            color: "text.secondary",
            fontSize: "0.65rem",
            fontWeight: 700,
            lineHeight: 1,
            px: 0.5,
            position: "absolute",
            right: -6,
          }}
        >
          {number}
        </Typography>
      </Box>
      <Box>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}
