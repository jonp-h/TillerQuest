import { redirect } from "next/navigation";
import MainContainer from "@/components/MainContainer";
import { redirectIfNewOrInactiveUser } from "@/lib/redirectUtils";
import { Paper, Typography, Alert, Card, CardContent } from "@mui/material";
import { DevicesOther, Warning } from "@mui/icons-material";
import DeviceApprovalActions from "./_components/DeviceApprovalActions";

interface DeviceApprovalPageProps {
  searchParams: Promise<{ user_code?: string }>;
}

export default async function DeviceApprovalPage({
  searchParams,
}: DeviceApprovalPageProps) {
  const session = await redirectIfNewOrInactiveUser();

  if (!session) {
    // If session is null, it means the user was redirected due to being NEW or INACTIVE
    return null;
  }

  const params = await searchParams;
  const userCode = params.user_code;

  // Redirect if no user code provided
  if (!userCode) {
    redirect("/auth/device-authorization");
  }

  return (
    <MainContainer>
      <div className="flex justify-center lg:pt-10">
        <Paper
          elevation={3}
          className="flex flex-col justify-center p-8 w-full h-screen lg:h-auto lg:w-1/2 xl:w-1/3"
        >
          <div className="flex flex-col gap-6">
            <DevicesOther
              sx={{
                fontSize: "4rem",
                margin: "auto",
                color: "primary.main",
              }}
            />
            <Typography variant="h4" component="h1" align="center">
              Authorize Device
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Device Code:
                </Typography>
                <Typography
                  variant="h3"
                  align="center"
                  sx={{
                    fontFamily: "monospace",
                    letterSpacing: "0.2em",
                    my: 2,
                  }}
                >
                  {userCode}
                </Typography>
              </CardContent>
            </Card>

            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="body2">
                A device is requesting access to your TillerQuest account as{" "}
                <strong>{session.user.username}</strong>.
              </Typography>
            </Alert>

            <Typography variant="body2" color="textSecondary">
              Only approve if you initiated this request from a device you own.
            </Typography>

            <DeviceApprovalActions userCode={userCode} />

            <Typography variant="caption" color="textSecondary" align="center">
              This authorization will expire after 30 minutes of inactivity
            </Typography>
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
