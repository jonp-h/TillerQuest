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
  isPurchaseable,
  userOwnsAbility,
  userIsCorrectClass,
  missingParentAbility,
  guildMembers,
  activePassive,
}: {
  ability: Ability;
  user: User;
  isPurchaseable: boolean;
  userOwnsAbility: boolean;
  userIsCorrectClass: boolean;
  missingParentAbility: boolean;
  guildMembers: guildMembers;
  activePassive: boolean;
}) {
  const [selectedUser, setSelectedUser] = React.useState<string>(
    guildMembers?.[0].id || "",
  );

  const guildMembersWithoutUser =
    guildMembers?.filter((member) => member.id !== user.id) || [];

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lackingResource =
    user.mana < (ability.manaCost || 0) ||
    user.hp < (ability.healthCost || 0 + 1);

  const isDead = user.hp === 0;

  const router = useRouter();

  const getBuyButtonText = () => {
    if (!isPurchaseable) {
      return "This ability is not available.";
    } else if (!userIsCorrectClass) {
      return "You are the wrong class to buy this ability.";
    } else if (missingParentAbility) {
      return "Buy the necessary parent ability first.";
    } else if (user.gemstones < ability.gemstoneCost) {
      return "You don't have enough gemstones to buy this ability.";
    }
    return "Buy Ability";
  };

  const getOwnedButtonText = () => {
    if (activePassive) {
      return "Activated";
    } else if (isDead) {
      return "You cannot use abilities while dead";
    } else if (lackingResource) {
      return (
        "Not enough " +
        (user.hp < (ability.healthCost || 0 + 1) ? "health" : "mana") +
        " to use this ability."
      );
    }
    return ability.duration === null
      ? "Use ability"
      : "Use ability for " + ability.duration + " minutes";
  };

  // ---------------- Use ability ----------------

  const handleUseAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);

    let targetUsers = [selectedUser];

    switch (ability.target) {
      case -1:
        targetUsers = [user.id];
        break;
      case 0:
        targetUsers = guildMembers
          ? guildMembers.map((member) => member.id)
          : [];
        break;
      case 1:
        targetUsers = [selectedUser];
        break;
    }

    const result = await selectAbility(user.id, targetUsers, ability);
    setFeedback(typeof result === "string" ? result : null);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.refresh();
    setIsLoading(false);
  };

  // ---------------- Buy ability ----------------

  const handleBuyAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!userIsCorrectClass) {
      setFeedback("You are not the correct class to buy this ability.");
      return;
    }

    if (missingParentAbility) {
      setFeedback("Buy the necessary parent ability first.");
      return;
    }

    if (user.gemstones < ability.gemstoneCost) {
      setFeedback("You don't have enough gemstones to buy this ability.");
      return;
    }

    // when buying an abillity, check passive. if passive immediatly use.
    // if passive, disable use button

    setFeedback(await buyAbility(user.id, ability));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.refresh();
    setIsLoading(false);
  };

  // -----------------------

  return (
    <>
      {feedback && (
        <Typography variant="body1" color="info">
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
            guildMembers={guildMembersWithoutUser}
          />
          <Button
            variant="contained"
            onClick={handleUseAbility}
            disabled={lackingResource || activePassive || isLoading || isDead}
          >
            {getOwnedButtonText()}
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
              user.gemstones < ability.gemstoneCost ||
              !isPurchaseable ||
              missingParentAbility ||
              !userIsCorrectClass ||
              isLoading
            }
            variant="contained"
            onClick={handleBuyAbility}
          >
            {getBuyButtonText()}
          </Button>
        </>
      )}
    </>
  );
}
