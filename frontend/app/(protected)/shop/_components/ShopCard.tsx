"use client";
import { equipItem, purchaseItem } from "@/data/shop/items";
import { Circle } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { Class, ShopItem } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

function ShopCard({
  user,
  item,
}: {
  user: {
    id: string;
    level: number;
    title: string | null;
    class: Class | null;
    inventory: ShopItem[];
    special: string[];
  };
  item: ShopItem;
}) {
  const [feedback, setFeedback] = React.useState<string>("");
  const router = useRouter();

  const handlePurchase = async (itemId: number) => {
    setFeedback(await purchaseItem(user.id, itemId));
    router.refresh();
  };

  const handleEquip = async (itemId: number) => {
    setFeedback(await equipItem(user.id, itemId));
    router.refresh();
  };

  return (
    <Paper
      elevation={3}
      className="min-h-24 text-center p-4 rounded-3xl hover:bg-inherit"
    >
      {item.specialReq && (
        <Image
          className="mx-auto my-2"
          src={"/badges/" + item.specialReq + ".png"}
          width={125}
          height={125}
          alt={item.name}
          draggable={false}
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <Typography
          variant="h5"
          className="text-2xl"
          color={item.specialReq ? "violet" : "lightgreen"}
        >
          {item.name}
        </Typography>
        {item.specialReq && (
          <Typography
            variant="body1"
            color={
              user.special.includes(item.specialReq) ? "info" : "textSecondary"
            }
            className="text-lg"
          >
            {item.description}
          </Typography>
        )}
        {item.classReq && (
          <Typography
            variant="body2"
            color={user.class === item.classReq ? "info" : "error"}
            className="text-lg pt-3"
          >
            {"Class requirement: " + item.classReq}
          </Typography>
        )}
        {item.levelReq && (
          <Typography
            variant="body2"
            color={user.level >= item.levelReq ? "info" : "error"}
            className="text-lg pt-3"
          >
            {"Level requirement: " + item.levelReq}
          </Typography>
        )}
        {user.inventory.some(
          (inventoryItem) => inventoryItem.id === item.id,
        ) ? (
          <Button
            variant="contained"
            color="primary"
            disabled={user.title === item.name}
            onClick={() => {
              handleEquip(item.id);
            }}
          >
            {user.title === item.name ? "Equipped" : "Equip title"}
          </Button>
        ) : (
          <Button
            variant="text"
            color="primary"
            disabled={user.inventory.includes(item)}
            onClick={() => handlePurchase(item.id)}
          >
            <Typography variant="body1" className="text-xl" color="gold">
              Buy for {item.price}
              <Circle />
            </Typography>
          </Button>
        )}
        {feedback && (
          <Typography variant="subtitle2" color="info">
            {feedback}
          </Typography>
        )}
      </div>
    </Paper>
  );
}

export default ShopCard;
