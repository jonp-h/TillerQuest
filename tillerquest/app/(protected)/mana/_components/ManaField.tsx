"use client";
import { getMana } from "@/data/user";
import { Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import React from "react";

interface ManaFieldProps {
  user: User;
  isWeekend: boolean;
  currentDate: Date;
  correctLocation: boolean;
}

const ManaField: React.FC<ManaFieldProps> = ({
  user,
  isWeekend,
  currentDate,
  correctLocation,
}) => {
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleGetMana = async (event: any) => {
    event.preventDefault();
    if (
      user.lastMana.toISOString().slice(0, 10) ===
      currentDate.toISOString().slice(0, 10)
    ) {
      setFeedback(
        "But while you sense the magic around you - you feel it is not yet time to attune to it."
      );
      return;
    } else if (isWeekend) {
      setFeedback(
        "But the magic seems dormant today, perhaps you should try again on a different day."
      );
      return;
    } else if (!correctLocation) {
      setFeedback(
        "But you feel no magic around you. You must be in the wrong place."
      );
      return;
    } else {
      try {
        await getMana(user);
        setFeedback("And as you focus, you feel your mana restoring.");
      } catch (error) {
        console.error(error);
        setFeedback(
          "But attuning to the magic fails, you feel no connection - and you feel the need to tell an adult."
        );
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
        <Button variant="contained" color="primary" type="submit">
          Get mana
        </Button>
      </form>
    </div>
  );
};

export default ManaField;
