import MainContainer from "@/components/MainContainer";
import React from "react";
import ShopCard from "./_components/ShopCard";
import { getAllShopItems } from "@/data/shop/items";
import { ShopItem } from "@prisma/client";
import { getUserInventory } from "@/data/user/getUser";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

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

      <div className="m-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {shopItems?.map((item) => <ShopCard user={user} item={item} />)}
      </div>
    </MainContainer>
  );
}

export default Shop;
