import MainContainer from "@/components/MainContainer";
import ShopCard from "./_components/ShopCard";
import { notFound } from "next/navigation";
import { Circle, Diamond, HelpOutline } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import RarityModal from "./_components/RarityModal";
import { secureGet } from "@/lib/secureFetch";
import { ShopItem } from "@tillerquest/prisma/browser";
import { UserInventory } from "./_components/types";
import ErrorAlert from "@/components/ErrorAlert";

async function Shop() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user.id) {
    return notFound();
  }

  const shopBadges = await secureGet<ShopItem[]>("/items/badges");
  const shopTitles = await secureGet<ShopItem[]>("/items/titles");
  const shopDices = await secureGet<ShopItem[]>("/items/dices");
  const shopObjects = await secureGet<ShopItem[]>("/items/objects");
  const user = await secureGet<UserInventory>(
    `/users/${session.user.id}/inventory`,
  );
  if (!user.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={user.error || "User not found."} />
      </MainContainer>
    );
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
            user.data.special.length === 0
              ? "You have no special statuses. Ask a gamemaster for more information."
              : "You have the following special statuses: " +
                user.data.special.join(", ") +
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
        You have {user.data.gold} <Circle htmlColor="gold" /> gold and{" "}
        {user.data.gemstones} <Diamond htmlColor="gemstones" /> gemstones.
      </Typography>
      <div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Badges
        </Typography>
        {shopBadges.ok &&
          shopBadges.data &&
          shopBadges.data.map((item) => (
            <ShopCard key={item.name} user={user.data} item={item} />
          ))}
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Titles
        </Typography>
        {shopTitles.ok &&
          shopTitles.data &&
          shopTitles.data.map((item) => (
            <ShopCard key={item.name} user={user.data} item={item} />
          ))}
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Dice Sets
        </Typography>
        {shopDices.ok &&
          shopDices.data &&
          shopDices.data.map((item) => (
            <ShopCard key={item.name} user={user.data} item={item} />
          ))}
        <Typography variant="h4" className="col-span-3 text-center mb-4">
          Objects
        </Typography>
        {shopObjects.ok &&
          shopObjects.data &&
          shopObjects.data.map((item) => (
            <ShopCard key={item.name} user={user.data} item={item} />
          ))}
      </div>
    </MainContainer>
  );
}

export default Shop;
