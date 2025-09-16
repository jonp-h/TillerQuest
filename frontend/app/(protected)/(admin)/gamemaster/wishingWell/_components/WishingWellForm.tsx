"use client";
import DialogButton from "@/components/DialogButton";
import { adminActivateWish, adminResetWish } from "@/data/admin/wishingWell";
import { List, ListItem, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function WishingWellForm({
  wish,
}: {
  wish: {
    wishVotes: {
      user: {
        name: string | null;
        lastname: string | null;
      };
      amount: number;
    }[];
  } & {
    image: string | null;
    id: number;
    name: string;
    description: string | null;
    value: number;
    scheduled: Date | null;
  };
}) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  const router = useRouter();

  const handleChange = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date to schedule the wish.");
      return;
    }

    const result = await adminActivateWish(wish.id, scheduledDate);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };
  const handleReset = async () => {
    const result = await adminResetWish(wish.id);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const style = {
    p: 0,
    maxWidth: 1600,
    borderRadius: 2,
    width: "100%",
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <>
      <div className="w-full">
        <div className="flex gap-10 items-center w-full">
          <Typography variant="h4">{wish.name}:</Typography>

          <Typography variant="h5" color="secondary">
            {wish.value}
          </Typography>
          <div className="flex gap-2 ml-auto">
            <DialogButton
              buttonText="Activate"
              dialogTitle={"Activate wish: " + wish.name}
              dialogContent={
                <div className="p-4 flex flex-col justify-center gap-4">
                  <Typography variant="body1" color="text.secondary">
                    {wish.description}
                  </Typography>
                  <TextField
                    type="date"
                    value={scheduledDate?.toISOString().slice(0, 10)}
                    onChange={(e) => setScheduledDate(new Date(e.target.value))}
                  />
                </div>
              }
              agreeText="Activate"
              disagreeText="Cancel"
              buttonVariant="contained"
              dialogFunction={handleChange}
            />
            <DialogButton
              buttonText="Reset"
              dialogTitle={"Activate wish: " + wish.name}
              dialogContent={"Are you sure you want to reset this wish?"}
              agreeText="Reset"
              disagreeText="Cancel"
              buttonVariant="contained"
              dialogFunction={handleReset}
              color="error"
            />
          </div>
        </div>
        {wish.scheduled && (
          <Typography
            variant="h5"
            color="success"
            align="center"
            sx={{ mt: 2 }}
          >
            Scheduled for:{" "}
            {wish.scheduled.toLocaleDateString("no-NO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </Typography>
        )}
        <List sx={style}>
          {wish.wishVotes.map((vote, index) => (
            <ListItem key={index}>
              <Typography
                variant="body1"
                color="text.secondary"
                alignContent={"center"}
              >
                {vote.user.name} {vote.user.lastname} ({vote.amount})
              </Typography>
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
}

export default WishingWellForm;
