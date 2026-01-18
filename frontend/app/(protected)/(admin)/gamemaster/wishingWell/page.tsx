import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import WishingWellForm from "./_components/WishingWellForm";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { Prisma } from "@tillerquest/prisma/browser";
import { DateToString } from "@/types/dateToString";

type WishReponse = Prisma.WishGetPayload<{
  include: {
    wishVotes: {
      select: {
        amount: true;
        user: {
          select: {
            name: true;
            lastname: true;
          };
        };
      };
    };
  };
}>[];

async function WishingWell() {
  await redirectIfNotAdmin();
  const wishes = await secureGet<DateToString<WishReponse>>("/admin/wishes");

  if (!wishes.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={wishes.error || "Failed to load wishes."} />
      </MainContainer>
    );
  }

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
          {wishes.data.map((wish) => (
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
