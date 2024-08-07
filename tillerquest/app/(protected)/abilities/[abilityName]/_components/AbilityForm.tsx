"use client";
import { buyAbility, selectAbility } from "@/data/abilities";
import { Button, Typography } from "@mui/material";
import { Ability, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AbilityUserSelect from "./AbilityUserSelect";

type guildMembers =
  | {
      id: string;
      image: string | null;
      username: string | null;
      hp: number;
      hpMax: number;
      mana: number;
      manaMax: number;
    }[]
  | null;

export default function AbilityForm({
  ability,
  user,
  userOwnsAbility,
  missingParentAbility,
  guildMembers,
}: {
  ability: Ability;
  user: User;
  userOwnsAbility: boolean;
  missingParentAbility: boolean;
  guildMembers: guildMembers;
}) {
  const [selectedUser, setSelectedUser] = React.useState<string>(
    guildMembers?.[0].id || ""
  );

  const [error, setError] = useState<string | null>(null);

  const insignificantMana = user.mana < ability.cost;

  const router = useRouter();

  // ---------------- Use ability ----------------

  const useAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    setError((await selectAbility(user, selectedUser, ability)) ?? null);
  };

  // ---------------- Buy ability ----------------

  const handleBuyAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (missingParentAbility) {
      setError("Buy the necessary parent ability first.");
      return;
    }

    if (user.gemstones < ability.cost) {
      setError("You don't have enough gemstones to buy this ability.");
      return;
    }

    setError(await buyAbility(user.id, ability));

    router.refresh();
  };

  // -----------------------

  return (
    <>
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      {/* Should not render use-functionality when user does not own ability. Passives should not be usable */}
      {userOwnsAbility ? (
        !ability.isPassive ? (
          // Rendered when user owns active ability
          <form
            onSubmit={useAbility}
            className="flex flex-col gap-4 items-center"
          >
            <AbilityUserSelect
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              guildMembers={guildMembers}
            />
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
          // Rendered when user owns passive ability
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
        // Rendered when user does not own ability
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