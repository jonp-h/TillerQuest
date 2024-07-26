"use client";
import {
  selectAbility,
  useDebuffAbility,
  useHealAbility,
} from "@/data/abilities";
import { Button, Typography } from "@mui/material";
import { Ability, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function UseAbilityForm({
  ability,
  user,
  userOwnsAbility,
}: {
  ability: Ability;
  user: User;
  userOwnsAbility: boolean;
}) {
  const insignificantMana = user.mana < ability.cost;

  const router = useRouter();

  const useAbility = async (event: any) => {
    event.preventDefault();
    console.log("called");

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

  return (
    <>
      {userOwnsAbility ? (
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
        <div className="flex flex-col gap-4 items-center">
          <Typography variant="body1" color="error">
            You don&apos;t own this ability. Buy it in the shop.
          </Typography>

          <Link href={"/shop"}>
            <Button variant="contained" color="error">
              Go to shop
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
