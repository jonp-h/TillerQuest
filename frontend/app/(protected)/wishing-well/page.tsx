import MainContainer from "@/components/MainContainer";
import React from "react";
import { requireActiveUser } from "@/lib/redirectUtils";
import WishCard from "./_components/WishCard";
import { getWishes } from "@/data/wish/wish";
import { Typography } from "@mui/material";

async function WishingWellPage() {
  const session = await requireActiveUser();

  if (!session?.user.id) {
    throw new Error("User error");
  }

  const wishes = await getWishes();

  return (
    <MainContainer>
      <div className="relative min-h-screen flex flex-col">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/Well.png')",
            backgroundSize: "cover",
            // filter: "blur(20px)",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex-1 mt-10 mx-60 flex flex-col">
          <h1 className="text-6xl text-center ">The Wishing Well</h1>
          <Typography variant="h6" align="center" color="primary" gutterBottom>
            Would you like for something extraordinary to happen?
          </Typography>

          <Typography variant="body1" align="center">
            Gather your guildmates and vote for the wishes you want to see
            fulfilled.
            <br />
            The more votes a wish receives, the more likely it is to grab the
            attention of the game masters.
          </Typography>
          <div className="grid grid-cols-4 gap-4 my-8">
            {wishes.map((wish) => (
              <WishCard key={wish.id} userId={session.user.id} wish={wish} />
            ))}
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

export default WishingWellPage;
