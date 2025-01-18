"use client";
import { buyAbility } from "@/data/abilities/transaction/purchaseAbility";
import { selectAbility } from "@/data/abilities/abilityUsage/useAbility";
import { Button, Typography } from "@mui/material";
import { $Enums, Ability, User } from "@prisma/client";
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
    guildMembers?.[0].id || "",
  );

  const [error, setError] = useState<string | null>(null);

  // If mana cost is null, the ability is a passive ability
  const lackingMana = user.mana < (ability.manaCost || 0);

  // const userIsCorrectClass = user.class === (ability.type as $Enums.Class);

  const userIsCorrectClass =
    !Object.values($Enums.Class).includes(ability.category as $Enums.Class) ||
    user.class === ability.category;

  const router = useRouter();

  // ---------------- Use ability ----------------

  const handleUseAbility = async (event: React.SyntheticEvent) => {
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

    if (user.gemstones < ability.gemstoneCost) {
      setError("You don't have enough gemstones to buy this ability.");
      return;
    }

    setError(await buyAbility(user, ability));

    await new Promise((resolve) => setTimeout(resolve, 2000));
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
            onSubmit={handleUseAbility}
            className="flex flex-col gap-4 items-center"
          >
            {guildMembers && (
              <AbilityUserSelect
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                guildMembers={guildMembers}
              />
            )}
            {lackingMana && (
              <Typography variant="body1" color="error">
                You don&apos;t have enough mana to use this ability.
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={lackingMana}
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
      ) : // Rendered when user does not own ability

      userIsCorrectClass ? (
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
      ) : (
        <Typography variant="body1" color="error">
          You&apos;re not the correct class to buy this ability.
        </Typography>
      )}
    </>
  );
}
