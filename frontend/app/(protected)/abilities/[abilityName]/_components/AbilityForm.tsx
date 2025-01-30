"use client";
import { buyAbility } from "@/data/abilities/transaction/purchaseAbility";
import { selectAbility } from "@/data/abilities/abilityUsage/useAbility";
import { Button, Typography } from "@mui/material";
import { $Enums, Ability, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AbilityUserSelect from "./AbilityUserSelect";
import { usePassive } from "@/data/passives/usePassive";

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
  activePassive,
}: {
  ability: Ability;
  user: User;
  userOwnsAbility: boolean;
  userIsCorrectClass: boolean;
  missingParentAbility: boolean;
  guildMembers: guildMembers;
  activePassive: boolean;
}) {
  const [selectedUser, setSelectedUser] = React.useState<string>(
    guildMembers?.[0].id || "",
  );

  const [feedback, setFeedback] = useState<string | null>(null);

  const lackingMana = user.mana < (ability.manaCost || 0);

  const router = useRouter();

  // ---------------- Use ability ----------------

  const handleUseAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    let targetUsers;

    switch (ability.target) {
      case -1:
        targetUsers = [user.id];
        break;
      case 0:
        targetUsers = guildMembers?.map((member) => member.id) || [];
        break;
      case 1:
        targetUsers = [selectedUser];
        break;
    }

    const result = await selectAbility(user, targetUsers, ability);
    setFeedback(typeof result === "string" ? result : null);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.refresh();
  };

  // ---------------- Buy ability ----------------

  const handleBuyAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (missingParentAbility) {
      setFeedback("Buy the necessary parent ability first.");
      return;
    }

    if (user.gemstones < ability.gemstoneCost) {
      setFeedback("You don't have enough gemstones to buy this ability.");
      return;
    }

    setFeedback(await buyAbility(user, ability));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.refresh();
  };

  // -----------------------

  return (
    <>
      {feedback && (
        <Typography variant="body1" color="error">
          {feedback}
        </Typography>
      )}
      {/* Should not render use-functionality when user does not own ability. Passives should not be usable */}
      {userOwnsAbility ? (
        <>
          <AbilityUserSelect
            target={ability.target}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            guildMembers={guildMembers}
          />
          {lackingMana && (
            <Typography variant="body1" color="error">
              Not enough mana to use this ability.
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleUseAbility}
            disabled={lackingMana || activePassive}
          >
            {!activePassive
              ? ability.duration === null
                ? "Use ability"
                : "Use ability for " + ability.duration + " minutes"
              : "Activated"}
          </Button>
        </>
      ) : (
        <>
          {user.gemstones < ability.gemstoneCost && (
            <Typography variant="body1" color="error">
              You don&apos;t have enough gemstones to buy this ability.
            </Typography>
          )}
          {missingParentAbility && (
            <Typography variant="body1" color="error">
              Buy the necessary parent ability first.
            </Typography>
          )}
          <Button
            disabled={
              user.gemstones < ability.gemstoneCost || missingParentAbility
            }
            variant="contained"
            onClick={handleBuyAbility}
          >
            Buy
          </Button>
        </>
      )}
    </>
  );
}
