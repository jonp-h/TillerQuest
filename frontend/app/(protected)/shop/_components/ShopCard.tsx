"use client";
import DialogButton from "@/components/DialogButton";
import RarityText from "@/components/RarityText";
import { equipItem, purchaseItem } from "@/data/shop/items";
import { Circle } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { Class, ShopItem } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

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
  const router = useRouter();

  const handlePurchase = async (itemId: number) => {
    await toast.promise(purchaseItem(user.id, itemId), {
      pending: "Processing purchase...",
      success: {
        render({ data }) {
          return data.toString() as string;
        },
      },
      error: {
        render({ data }) {
          if (data instanceof Error) {
            return data.message;
          }
          return "An error occurred while purchasing the item.";
        },
      },
    });
    router.refresh();
  };

  const handleEquip = async (itemId: number) => {
    await toast.promise(equipItem(user.id, itemId), {
      pending: "Equipping item...",
      success: {
        render({ data }) {
          return data.toString() as string;
        },
      },
      error: {
        render({ data }) {
          if (data instanceof Error) {
            return data.message;
          }
          return "An error occurred while equipping the item.";
        },
      },
    });
    router.refresh();
  };

  return (
    <Paper
      elevation={3}
      className="min-h-24 text-center p-4 rounded-3xl hover:bg-inherit"
    >
      {item.icon && (
        <Image
          className="mx-auto my-2"
          src={"/items/" + item.icon + ".png"}
          width={125}
          height={125}
          alt={item.name}
          draggable={false}
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <RarityText width="1/2" className="text-3xl" rarity={item.rarity}>
          {item.name}
        </RarityText>
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
          <DialogButton
            buttonText={
              <Typography variant="body1" className="text-xl" color="gold">
                Buy for {item.price}
                <Circle />
              </Typography>
            }
            dialogTitle={`Buy ${item.name}`}
            dialogContent={
              <Typography variant="body1" component={"span"}>
                Are you sure you want to buy the {item.type.toLowerCase()}{" "}
                {item.name} for{" "}
                <Typography color="gold" component="span">
                  {item.price} <Circle />
                </Typography>
                ?
              </Typography>
            }
            agreeText="Buy"
            disagreeText="Cancel"
            buttonVariant="text"
            dialogFunction={() => handlePurchase(item.id)}
          />
        )}
      </div>
    </Paper>
  );
}

export default ShopCard;
