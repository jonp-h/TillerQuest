"use client";
import { equipItem, purchaseItem } from "@/data/shop/items";
import { Circle } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { ShopItem } from "@prisma/client";
import { useRouter } from "next/navigation";
import React from "react";

function ShopCard({
  user,
  item,
}: {
  user: {
    id: string;
    title: string | null;
    inventory: ShopItem[];
  };
  item: ShopItem;
}) {
  const [feedback, setFeedback] = React.useState<string>("");
  const router = useRouter();

  const handlePurchase = async (itemId: string) => {
    setFeedback(await purchaseItem(user.id, itemId));
    router.refresh();
  };

  const handleEquip = async (itemId: string) => {
    setFeedback(await equipItem(user.id, itemId));
  };

  return (
    <Paper
      elevation={3}
      className="max-w-1/3 min-h-24 text-center p-4 rounded-3xl hover:scale-105 hover:cursor-pointer transform duration-500 ease-in-out"
    >
      <Typography variant="h5" className="text-2xl" color="lightgreen">
        {item.name}
      </Typography>
      <Typography variant="subtitle2" className="text-lg">
        {item.description}
      </Typography>
      <Typography variant="subtitle2" className="text-lg">
        {item.classReq ? "Class requirement: " + item.classReq : null}{" "}
        {item.levelReq ? "Level requirement: " + item.levelReq : null}{" "}
        {item.specialReq ? "Special requirement: " + item.specialReq : null}
      </Typography>
      {user.inventory.some((inventoryItem) => inventoryItem.id === item.id) ? (
        <Button
          variant="contained"
          color="primary"
          disabled={user.title === item.name}
          onClick={() => {
            handleEquip(item.id);
          }}
        >
          {user.title === item.name ? "Equipped" : "Equip"}
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
    </Paper>
  );
}

export default ShopCard;
