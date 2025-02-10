"use client";
import { getDailyMana } from "@/data/mana/mana";
import { Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import React, { SyntheticEvent, useState } from "react";

interface ManaFormProps {
  user: User;
  isWeekend: boolean;
  currentDate: Date;
  correctLocation: boolean;
}

function ManaForm({
  user,
  isWeekend,
  currentDate,
  correctLocation,
}: ManaFormProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGetMana = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);

    if (
      user.lastMana.toISOString().slice(0, 10) ===
      currentDate.toISOString().slice(0, 10)
    ) {
      setFeedback(
        "But while you sense the magic around you - you feel it is not yet time to attune to it.",
      );
      setLoading(false);
      return;
    } else if (isWeekend) {
      setFeedback(
        "But the magic seems dormant today, perhaps you should try again on a different day.",
      );
      setLoading(false);
      return;
    } else if (!correctLocation) {
      setFeedback(
        "But you feel no magic around you. You must be in the wrong place.",
      );
      setLoading(false);
      return;
    } else {
      try {
        await getDailyMana(user);
        setLoading(false);
        setFeedback(
          "And as you focus, you feel your mana restoring. You also find a token in your pocket.",
        );
      } catch (error) {
        console.error(error);
        setFeedback(
          "But attuning to the magic fails, you feel no connection - and you feel the need to tell an adult.",
        );
        setLoading(false);
      }
    }
  };

  return (
    <div>
      {feedback && (
        <Typography variant="h5" align="center" color={"red"}>
          {feedback}
        </Typography>
      )}
      <form onSubmit={handleGetMana}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get mana"}
        </Button>
      </form>
    </div>
  );
}

export default ManaForm;
