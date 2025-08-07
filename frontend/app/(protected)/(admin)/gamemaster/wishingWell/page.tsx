import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import React from "react";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import WishingWellForm from "./_components/WishingWellForm";
import { adminGetWishes } from "@/data/admin/wishingWell";

async function WishingWell() {
  await redirectIfNotAdmin();
  const wishes = await adminGetWishes();

  const style = {
    p: 0,
    width: "60%",
    maxWidth: 1600,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Wishing Well
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {wishes?.map((wish) => (
            <ListItem key={wish.id} sx={{ padding: 2 }}>
              <WishingWellForm wish={wish} />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default WishingWell;
