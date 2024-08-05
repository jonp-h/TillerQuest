"use client";
import { buyAbility, selectAbility } from "@/data/abilities";
import { createAbility } from "@/data/admin";
import { Button, Typography } from "@mui/material";
import { Ability, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function UseAbilityForm({
  ability,
  user,
  userOwnsAbility,
  missingParentAbility,
}: {
  ability: Ability;
  user: User;
  userOwnsAbility: boolean;
  missingParentAbility: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const insignificantMana = user.mana < ability.cost;

  const router = useRouter();

  const useAbility = async (event: any) => {
    event.preventDefault();

    selectAbility(
      user.id,
      user.mana,
      ability.type,
      ability.cost,
      ability.value,
      ability.xpGiven,
      ability.duration
    );

    router.push("/profile/" + user.username);
    router.refresh();
  };

  const handleBuyAbility = async (event: any) => {
    event.preventDefault();

    if (missingParentAbility) {
      setError("Buy the necessary parent ability first.");
      return;
    }

    if (user.gemstones < ability.cost) {
      setError("You don't have enough mana to buy this ability.");
      return;
    }

    await buyAbility(user.id, ability.name, ability.cost);

    router.refresh();
  };

  return (
    <>
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      {userOwnsAbility ? (
        !ability.isPassive ? (
          <form
            onSubmit={useAbility}
            className="flex flex-col gap-4 items-center"
          >
            {insignificantMana && (
              <Typography variant="body1" color="error">
                You don&apos;t have enough mana to use this ability.
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={insignificantMana}
            >
              Use
            </Button>
          </form>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={true}
          >
            Activated
          </Button>
        )
      ) : (
        <form
          onSubmit={handleBuyAbility}
          className="flex flex-col gap-4 items-center"
        >
          <Typography variant="body1" color="error">
            You don&apos;t own this ability.
          </Typography>

          <Button variant="contained" color="error" type="submit">
            Buy ability
          </Button>
        </form>
      )}
    </>
  );
}
