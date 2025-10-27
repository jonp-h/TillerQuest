import MainContainer from "@/components/MainContainer";
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
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import RarityModal from "./_components/RarityModal";

async function Shop() {
  const session = await redirectIfNotActiveUser();

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
      <Typography
        variant="h2"
        component={"h1"}
        fontWeight={600}
        sx={{ marginTop: 6 }}
        align="center"
      >
        Shop
      </Typography>
      <Typography
        variant="h5"
        component={"h2"}
        color="success"
        sx={{ marginTop: 3 }}
        className="text-2xl text-center mt-5 text-green-400"
      >
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
      </Typography>
      <div className="flex justify-center mt-5">
        <RarityModal />
      </div>
      <Typography
        variant="h6"
        component={"h3"}
        sx={{ marginTop: 3 }}
        align="center"
      >
        You have {user.gold} <Circle htmlColor="gold" /> gold
      </Typography>
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
