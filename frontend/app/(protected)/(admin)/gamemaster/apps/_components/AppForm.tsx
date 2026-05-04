"use client";
import DialogButton from "@/components/DialogButton";
import { securePatchClient, securePostClient } from "@/lib/secureFetchClient";
import { DateToString } from "@/types/dateToString";
import { TextField, Typography } from "@mui/material";
import { App } from "@tillerquest/prisma/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function AppForm({ app }: { app: DateToString<App> }) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(
    app.downloadUrl,
  );

  const router = useRouter();

  const handleUpdateApp = async () => {
    console.log("Updating app with download URL: " + downloadUrl);
    const result = await securePatchClient<string>(`/admin/apps/${app.name}`, {
      downloadUrl: downloadUrl ? downloadUrl : null,
    });

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date to schedule the event.");
      return;
    }

    const result = await securePatchClient<string>(
      `/admin/apps/${app.name}/schedule`,
      {
        scheduledDate: scheduledDate,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleRemoveSchedule = async () => {
    const result = await securePostClient<string>(
      `/admin/apps/${app.name}/remove-schedule`,
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  return (
    <>
      <div className="w-full">
        <div className="flex gap-10 items-center w-full">
          <Typography variant="h4">{app.name}:</Typography>

          <Typography variant="body1" color="secondary">
            {app.shortDescription}
          </Typography>
          <TextField
            type="text"
            label="Download URL"
            fullWidth
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
          />
          <DialogButton
            buttonText="Update app"
            dialogTitle={"Update app: " + app.name}
            dialogContent={"Are you sure you want to update this app?"}
            agreeText="Update"
            disagreeText="Cancel"
            buttonVariant="contained"
            dialogFunction={handleUpdateApp}
            color="info"
          />
          <div className="flex gap-2 ml-auto">
            <DialogButton
              buttonText="Schedule event"
              dialogTitle={"Schedule app event: " + app.name}
              dialogContent={
                <div className="p-4 flex flex-col justify-center gap-4">
                  <Typography variant="body1" color="text.secondary">
                    {app.description}
                  </Typography>
                  <TextField
                    type="date"
                    label="Date"
                    value={scheduledDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split("-");
                      const newDate = scheduledDate
                        ? new Date(scheduledDate)
                        : new Date();
                      newDate.setFullYear(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                      );
                      setScheduledDate(newDate);
                    }}
                  />
                  <TextField
                    type="time"
                    label="Time"
                    value={scheduledDate?.toTimeString().slice(0, 5) || ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = scheduledDate
                        ? new Date(scheduledDate)
                        : new Date();
                      newDate.setHours(
                        parseInt(hours),
                        parseInt(minutes),
                        0,
                        0,
                      );
                      setScheduledDate(newDate);
                    }}
                  />
                </div>
              }
              agreeText="Schedule"
              disagreeText="Cancel"
              buttonVariant="contained"
              dialogFunction={handleSchedule}
            />
            <DialogButton
              buttonText="Remove scheduled event"
              dialogTitle={"Remove scheduled event for " + app.name}
              dialogContent={
                "Are you sure you want to remove the scheduled event for this app?"
              }
              agreeText="Remove"
              disagreeText="Cancel"
              buttonVariant="contained"
              dialogFunction={handleRemoveSchedule}
              color="error"
            />
          </div>
        </div>
        {app.scheduled && (
          <Typography
            variant="h5"
            color="success"
            align="center"
            sx={{ mt: 2 }}
          >
            Scheduled for: {new Date(app.scheduled).toLocaleString()}
          </Typography>
        )}
      </div>
    </>
  );
}

export default AppForm;
