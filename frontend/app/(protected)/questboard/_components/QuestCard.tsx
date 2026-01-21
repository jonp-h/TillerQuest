import { Typography } from "@mui/material";
import { Quest } from "@tillerquest/prisma/browser";

function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div>
      <Typography variant="h2">{quest.name}</Typography>
      <Typography variant="body1">{quest.description}</Typography>
      <Typography variant="body2">Reward: {quest.rewardXp ?? 0} XP</Typography>
      <Typography variant="body2">
        Reward: {quest.rewardGold ?? 0} Gold
      </Typography>
      <Typography variant="body2">
        Reward Item ID: {quest.rewardItemId ?? "None"}
      </Typography>
      <Typography variant="body2">Questgiver: {quest.questgiver}</Typography>
    </div>
  );
}

export default QuestCard;
