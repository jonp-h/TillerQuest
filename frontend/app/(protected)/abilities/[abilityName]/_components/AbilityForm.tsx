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
  targetHasPassive,
}: {
  ability: Ability;
  user: User;
  isPurchaseable: boolean;
  userOwnsAbility: boolean;
  userIsCorrectClass: boolean;
  missingParentAbility: boolean;
  guildMembers: guildMembers;
  targetHasPassive: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<string>(
    guildMembers?.[0].id || "",
  );
  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const guildMembersWithoutUser =
    guildMembers?.filter((member) => member.id !== user.id) || [];

  const lackingResource =
    user.mana < (ability.manaCost || 0) || user.hp <= (ability.healthCost || 0);

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
      return "Insufficient gemstones";
    }
    return "Buy Ability";
  };

  const getOwnedButtonText = () => {
    /*if (ability.isDungeon) {
      return "Go to dungeon";
    } else*/
    if (targetHasPassive) {
      return "Activated";
    } else if (isDead) {
      return "You cannot use abilities while dead";
    } else if (lackingResource) {
      return (
        "Not enough " +
        (user.hp <= (ability.healthCost || 0) ? "health" : "mana") +
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
    /*if (ability.isDungeon) {
      router.push("/dungeon");
    } else */
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
      case "Self":
        targetUsers = [user.id];
        break;
      case "All":
        targetUsers = guildMembers
          ? guildMembers.map((member) => member.id)
          : [];
        break;
      case "Others":
        targetUsers = guildMembersWithoutUser.map((member) => member.id);
        break;
      case "SingleTarget":
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

    // Frontend validation
    if (!userIsCorrectClass) {
      toast.error("You are not the correct class to buy this ability.");
      setIsLoading(false);
      return;
    }

    if (missingParentAbility) {
      toast.error("Buy the necessary parent ability first.");
      setIsLoading(false);
      return;
    }

    if (user.gemstones < ability.gemstoneCost) {
      toast.error("You don't have enough gemstones to buy this ability. ");
      setIsLoading(false);
      return;
    }

    // when buying an abillity, check passive. if passive immediately activate
    // if passive, disable use button

    toast.promise(buyAbility(user.id, ability.name), {
      pending: "Buying ability...",
      success: {
        render: ({ data }) => {
          return data;
        },
      },
      error: {
        render({ data }) {
          return data instanceof Error
            ? `${data.message}`
            : "An error occurred while buying the ability.";
        },
      },
    });

    setIsLoading(false);
    router.refresh();
  };

  // -----------------------

  return (
    <>
      {/* Should not render use-functionality when user does not own ability. Passives should not be usable */}
      {userOwnsAbility ? (
        <>
          {!ability.isDungeon ? (
            <AbilityUserSelect
              target={ability.target}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              guildMembers={guildMembersWithoutUser}
            />
          ) : null}
          {ability.isDungeon ? (
            <Button
              variant="contained"
              onClick={() => router.push("/dungeons")}
              disabled={false}
            >
              Go to the dungeons
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleUseAbility}
              disabled={
                lackingResource || targetHasPassive || isLoading || isDead
              }
            >
              {getOwnedButtonText()}
            </Button>
          )}
        </>
      ) : (
        <>
          {user.gemstones < ability.gemstoneCost && (
            <Typography variant="body1" color="error">
              Insufficient gemstones
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
