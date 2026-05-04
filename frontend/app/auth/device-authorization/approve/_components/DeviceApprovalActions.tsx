"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, Box, Alert } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface DeviceApprovalActionsProps {
  userCode: string;
}

export default function DeviceApprovalActions({
  userCode,
}: DeviceApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: approveError } = await authClient.device.approve({
        userCode,
      });

      if (approveError) {
        setError(approveError.error_description || "Failed to approve device");
        setLoading(false);
        return;
      }

      // Redirect to success page
      router.push("/auth/device-authorization/success");
    } catch (err) {
      console.error("Approval error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: denyError } = await authClient.device.deny({
        userCode,
      });

      if (denyError) {
        setError(denyError.error_description || "Failed to deny device");
        setLoading(false);
        return;
      }

      // Redirect to denied page
      router.push("/auth/device-authorization/denied");
    } catch (err) {
      console.error("Deny error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <Box display="flex" gap={2}>
        <Button
          variant="outlined"
          color="error"
          size="large"
          fullWidth
          onClick={handleDeny}
          disabled={loading}
          startIcon={<Cancel />}
        >
          Deny
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          onClick={handleApprove}
          disabled={loading}
          startIcon={<CheckCircle />}
        >
          {loading ? "Approving..." : "Approve"}
        </Button>
      </Box>
    </>
  );
}
