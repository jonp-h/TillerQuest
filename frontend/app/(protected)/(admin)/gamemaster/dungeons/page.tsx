import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import DungeonsForm from "./_components/DungeonsForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import { DungeonInfo } from "./_components/types";
import ErrorAlert from "@/components/ErrorAlert";

async function Dungeons() {
  await redirectIfNotAdmin();
  const dungeonInfo = await secureGet<DungeonInfo[]>(`/admin/dungeons`);

  if (!dungeonInfo.ok) {
    return (
      <MainContainer>
        <ErrorAlert
          message={dungeonInfo.error || "Failed to load dungeon information."}
        />
      </MainContainer>
    );
  }

  const style = {
    p: 0,
    width: "90%",
    maxWidth: 1350,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Dungeons
      </Typography>
      <Typography variant="subtitle1" color="error" align="center">
        View enemies. Enemy management is not available yet.
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {dungeonInfo.data.map((dungeonInfo) => (
            <ListItem key={dungeonInfo.name} sx={{ padding: 2 }}>
              <DungeonsForm dungeonInfo={dungeonInfo} />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default Dungeons;
