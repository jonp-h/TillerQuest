import MainContainer from "@/components/MainContainer";
import React from "react";
import ShopCard from "./_components/ShopCard";
import {
  getShopBadges,
  getShopObjects,
  getShopTitles,
} from "@/data/shop/items";
import { getUserInventory } from "@/data/user/getUser";
import { notFound } from "next/navigation";
import { Circle, HelpOutline } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import { requireActiveUser } from "@/lib/redirectUtils";
import RarityModal from "./_components/RarityModal";

async function Shop() {
  const session = await requireActiveUser();

  if (!session?.user.id) {
    return notFound();
  }

  const shopBadges = await getShopBadges();
  const shopTitles = await getShopTitles();
  const shopObjects = await getShopObjects();
  const user = await getUserInventory(session.user.id);
  if (!user) {
    return notFound();
  }

  return (
    <MainContainer>
      <h1 className=" text-6xl text-center mt-5">Shop</h1>
      <h2 className="text-2xl text-center mt-5 text-green-400">
        Buy items to help you on your journey. Some items require participation
        in certain IRL events to unlock{" "}
        <Tooltip
          title={
            user.special.length === 0
              ? "You have no special statuses. Ask a gamemaster for more information."
              : "You have the following special statuses: " +
                user.special.join(", ") +
                ". Ask a gamemaster for more information."
          }
        >
          <HelpOutline className="text-white cursor-help" />
        </Tooltip>
      </h2>
      <div className="flex justify-center mt-5">
        <RarityModal />
      </div>
      <h3 className="text-xl text-center mt-5">
        You have {user.gold} <Circle htmlColor="gold" /> gold
      </h3>
      <div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Badges
        </Typography>
        {shopBadges?.map((item) => (
          <ShopCard key={item.name} user={user} item={item} />
        ))}
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Titles
        </Typography>
        {shopTitles?.map((item) => (
          <ShopCard key={item.name} user={user} item={item} />
        ))}
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Objects
        </Typography>
        {shopObjects?.map((item) => (
          <ShopCard key={item.name} user={user} item={item} />
        ))}
      </div>
    </MainContainer>
  );
}

export default Shop;
