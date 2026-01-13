"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Paper, Typography, TextField, Box, Chip, Alert } from "@mui/material";
import Image from "next/image";
import DialogButton from "@/components/DialogButton";
import { UploadReviewFormProps } from "./types";
import { securePostClient } from "@/lib/secureFetchClient";

export default function UploadReviewForm({
  upload,
}: {
  upload: UploadReviewFormProps;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    const result = await securePostClient<string>(
      `/admin/images/pending/${upload.id}`,
      {
        action: "APPROVE",
        reason: rejectionReason,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
    router.refresh();
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    const result = await securePostClient<string>(
      `/admin/images/pending/${upload.id}`,
      {
        action: "REJECT",
        reason: rejectionReason,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
    router.refresh();
    setLoading(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
      }}
    >
      {/* Image Preview */}
      <Box
        sx={{
          flex: "0 0 300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {upload.previewError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {upload.previewError}
          </Alert>
        ) : upload.previewUrl ? (
          <Image
            src={upload.previewUrl}
            alt={`Guild image for ${upload.guildName}`}
            width={300}
            height={300}
            style={{ objectFit: "contain" }}
            unoptimized // OWASP: Don't send to Next.js image optimization (already base64)
            priority // Load immediately for admin review
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No preview available
          </Typography>
        )}
      </Box>

      {/* Upload Details */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">
          {upload.guild?.name || "Unknown Guild"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Uploaded by user: ${upload.uploader.username}`}
            size="small"
          />
          <Chip
            label={`Name: ${upload.uploader.name} ${upload.uploader.lastname}`}
            size="small"
          />
          <Chip
            label={`Date: ${new Date(upload.uploadedAt).toLocaleDateString()}`}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Filename: {upload.filename}
        </Typography>

        <TextField
          label="Rejection Reason"
          multiline
          rows={3}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Provide a reason if rejecting..."
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
          <DialogButton
            buttonText="Approve"
            dialogTitle="Approve Image"
            dialogContent={
              <Typography>
                Are you sure you want to approve this image for{" "}
                <strong>{upload.guildName}</strong>?
                <br />
                The image will be moved to the public guilds folder.
              </Typography>
            }
            agreeText="Approve"
            disagreeText="Cancel"
            buttonVariant="contained"
            color="success"
            dialogFunction={handleApprove}
            disabled={loading}
          />

          <DialogButton
            buttonText="Reject"
            dialogTitle="Reject Image"
            dialogContent={
              <Typography>
                Are you sure you want to reject this image for{" "}
                <strong>{upload.guildName}</strong>?
                <br />
                The image will be permanently deleted from quarantine.
              </Typography>
            }
            agreeText="Reject"
            disagreeText="Cancel"
            buttonVariant="outlined"
            color="error"
            dialogFunction={handleReject}
            disabled={loading || !rejectionReason.trim()}
          />
        </Box>
      </Box>
    </Paper>
  );
}
