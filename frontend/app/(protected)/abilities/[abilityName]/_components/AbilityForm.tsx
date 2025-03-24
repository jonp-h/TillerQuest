"use client";
import { buyAbility } from "@/data/abilities/transaction/purchaseAbility";
import { selectAbility } from "@/data/abilities/abilityUsage/useAbility";
import { Button, Typography } from "@mui/material";
import { Ability, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AbilityUserSelect from "./AbilityUserSelect";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import { diceSettings } from "@/lib/diceSettings";
import { GamesTwoTone } from "@mui/icons-material";

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
  const [selectedUser, setSelectedUser] = useState<string>(
    guildMembers?.[0].id || "",
  );
  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const guildMembersWithoutUser =
    guildMembers?.filter((member) => member.id !== user.id) || [];

  const lackingResource =
    user.mana < (ability.manaCost || 0) ||
    user.hp <= (ability.healthCost || 0 + 1);

  const isDead = user.hp === 0;

  const router = useRouter();

  // ---------------- Initialize dice ----------------

  const initializeDiceBox = async () => {
    try {
      const newDiceBox = new DiceBox("#dice-canvas", diceSettings);
      await newDiceBox.initialize();
      setDiceBox(newDiceBox);
    } catch (error) {
      console.error("Error initializing DiceBox:", error);
    }
  };

  // Delay of 500ms to prevent the dice box from rendering before the component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeDiceBox();
    }, 500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  // ---------------- UI helpers ----------------

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
        (user.hp <= (ability.healthCost || 0 + 1) ? "health" : "mana") +
        " to use this ability."
      );
    } else if (!diceBox && ability.diceNotation) {
      return "Prepare dice!";
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

    // if diceBox is required and not initialized, initialize it first
    if (!diceBox && ability.diceNotation) {
      initializeDiceBox();
      toast.info("Preparing dice..", { autoClose: 1000 });
      setIsLoading(false);
      return;
    } else if (diceBox) {
      diceBox.clearDice();
      // TODO: enable custom colorsets for different abilities
      // diceBox.updateConfig({
      //   ...diceSettings,
      //   theme_customColorset: colorsets.fire,
      // });
    }

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

    const result = await selectAbility(user.id, targetUsers, ability.name);
    // if result is only a string, it's an error message
    if (typeof result === "string") {
      toast.error(result);
      setIsLoading(false);
      router.refresh();
      return;
    }

    // if result has a diceRoll, roll the dice
    if (result?.diceRoll && diceBox) {
      diceBox
        .roll(`${ability.diceNotation}@${result.diceRoll}`)
        .then(() => {
          toast.success(result.message);
        })
        .finally(() => {
          setIsLoading(false);
          router.refresh();
        });
      // if result has no diceRoll, just show the message
    } else {
      toast.success(result?.message);
      setIsLoading(false);
      router.refresh();
    }
  };

  // ---------------- Buy ability ----------------

  const handleBuyAbility = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!userIsCorrectClass) {
      toast.error("You are not the correct class to buy this ability.");
      return;
    }

    if (missingParentAbility) {
      toast.error("Buy the necessary parent ability first.");
      return;
    }

    if (user.gemstones < ability.gemstoneCost) {
      toast.error("You don't have enough gemstones to buy this ability. ");
      return;
    }

    // when buying an abillity, check passive. if passive immediately activate
    // if passive, disable use button

    toast.success(await buyAbility(user.id, ability.name));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.refresh();
    setIsLoading(false);
  };

  // -----------------------

  return (
    <>
      {/* Should not render use-functionality when user does not own ability. Passives should not be usable */}
      {userOwnsAbility ? (
        <>
          {diceBox && <GamesTwoTone className="absolute" />}
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
