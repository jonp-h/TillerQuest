"use client";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { giveMana } from "@/data/user";
import { Button } from "@mui/material";

export default function ManaForm(props: any) {
  const handleGiveMana = async () => {
    await giveMana(props.user.id, 4);
    toast.success("Mana given", {
      style: { background: "#581c87", color: "#fff" },
    });
  };

  return (
    <div className="flex flex-col text-center gap-6">
      <Toaster />
      <h2 className="text-xl">
        Those who wander into Midgard
        <br /> are granted mana by the Gods
      </h2>
      <h2 className="text-lg">Do you accept?</h2>
      <Button size="large" variant="contained" onClick={handleGiveMana}>
        Get mana
      </Button>
    </div>
  );
}
