"use client";
import DialogButton from "@/components/DialogButton";
import RarityText from "@/components/RarityText";
import { securePatchClient, securePostClient } from "@/lib/secureFetchClient";
import { Circle, Diamond } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { Class, ShopItem } from "@tillerquest/prisma/browser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function ShopCard({
  user,
  item,
}: {
  user: {
    id: string;
    level: number;
    gemstones: number;
    title: string | null;
    diceColorset: string | null;
    class: Class | null;
    inventory: ShopItem[];
    special: string[];
  };
  item: ShopItem;
}) {
  const router = useRouter();

  const handlePurchase = async (itemId: number) => {
    const result = await securePostClient<string>(
      `/users/${user.id}/inventory`,
      {
        itemId: itemId,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleEquip = async (itemId: number) => {
    const result = await securePatchClient<string>(`/users/${user.id}/equip`, {
      itemId: itemId,
    });

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

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
          {item.name.replaceAll("_", " ")}
        </RarityText>
        {item.specialReq && (
          <Typography
            variant="body1"
            sx={{ marginTop: 1 }}
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
            variant="body1"
            sx={{ marginTop: 1 }}
            color={user.class === item.classReq ? "info" : "error"}
          >
            {"Class requirement: " + item.classReq}
          </Typography>
        )}
        {item.levelReq && (
          <Typography
            variant="body1"
            sx={{ marginTop: 1 }}
            color={user.level >= item.levelReq ? "info" : "error"}
          >
            {"Level requirement: " + item.levelReq}
          </Typography>
        )}
        {item.gemstonesSpentReq && (
          <Typography
            variant="body1"
            sx={{ marginTop: 1 }}
            color={
              user.inventory.reduce((acc, inventoryItem) => {
                if (inventoryItem.currency === "GEMSTONES") {
                  return acc + inventoryItem.price;
                }
                return acc;
              }, 0) >= item.gemstonesSpentReq
                ? "info"
                : "error"
            }
          >
            {"Spend at least " +
              item.gemstonesSpentReq.toLocaleString() +
              " gemstones in the shop to buy this item"}
          </Typography>
        )}
        {user.inventory.some(
          (inventoryItem) => inventoryItem.id === item.id,
        ) ? (
          item.type !== "Object" && (
            <Button
              variant="contained"
              color="primary"
              disabled={
                user.title === item.name || user.diceColorset === item.name
              }
              onClick={() => {
                handleEquip(item.id);
              }}
            >
              {user.title === item.name ? "Equipped" : "Equip " + item.type}
            </Button>
          )
        ) : (
          <DialogButton
            buttonText={
              <Typography
                variant="body1"
                className="text-xl"
                color={item.currency === "GOLD" ? "gold" : "gemstones"}
              >
                Buy for {item.price.toLocaleString()}
                {item.currency === "GOLD" ? <Circle /> : <Diamond />}
              </Typography>
            }
            dialogTitle={`Buy ${item.name}`}
            dialogContent={
              <Typography variant="body1" component={"span"}>
                Are you sure you want to buy the {item.type.toLowerCase()}{" "}
                {item.name} for{" "}
                <Typography
                  color={item.currency === "GOLD" ? "gold" : "gemstones"}
                  component="span"
                >
                  {item.price.toLocaleString()}
                  {item.currency === "GOLD" ? <Circle /> : <Diamond />}
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
