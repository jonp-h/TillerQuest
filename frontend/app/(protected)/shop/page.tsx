import MainContainer from "@/components/MainContainer";
import React from "react";
import ShopCard from "./_components/ShopCard";
import { getAllShopItems } from "@/data/shop/items";
import { ShopItem } from "@prisma/client";
import { getUserInventory } from "@/data/user/getUser";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Circle } from "@mui/icons-material";

async function Shop() {
  const session = await auth();

  if (!session?.user.id) {
    return notFound();
  }

  const shopItems = await getAllShopItems();
  const user = await getUserInventory(session.user.id);
  if (!user) {
    return notFound();
  }

  return (
    <MainContainer>
      <h1 className=" text-6xl text-center mt-5">Shop</h1>
      <h2 className="text-2xl text-center mt-5">
        Buy items to help you on your journey. Some items have requirements, and
        require participation in certain IRL events.
      </h2>
      <h3 className="text-xl text-center mt-5">
        You have {user.gold} <Circle htmlColor="gold" /> gold
      </h3>
      <div className="m-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {shopItems?.map((item) => (
          <ShopCard key={item.name} user={user} item={item} />
        ))}
      </div>
    </MainContainer>
  );
}

export default Shop;
