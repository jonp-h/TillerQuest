import { Typography } from "@mui/material";
import { Quest } from "@tillerquest/prisma/browser";

function QuestCard({ quest }: { quest: Quest }) {
  // Deterministic rotation based on quest ID for natural pinned look
  // Using a simple hash to spread sequential IDs across rotation values
  const hash = quest.id * 2654435761;
  const rotation = ((hash % 9) - 4) * 0.5; // -2 to 2 degrees with 0.5 degree increments

  return (
    <div
      className="relative bg-amber-50 p-6 rounded-sm shadow-lg border-2 border-amber-100 hover:shadow-2xl transition-shadow duration-300 hover:scale-105"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Pin/Tack at the top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full shadow-md border-2 border-red-800" />

      {/* Quest Content */}
      <div className="mt-4">
        <Typography
          variant="h5"
          className="!font-bold !text-gray-900 !mb-3 border-b-2 border-amber-900 !pb-2"
        >
          {quest.name}
        </Typography>

        <Typography variant="body1" className="!text-gray-800 !mb-4 !italic">
          {quest.description}
        </Typography>

        <div className="space-y-1 !mt-4 pt-3 border-t border-amber-200">
          <Typography variant="body2" className="!text-gray-700 !font-semibold">
            Rewards:
          </Typography>

          {quest.rewardXp && quest.rewardXp > 0 && (
            <Typography variant="body2" className="!text-gray-700 !ml-4">
              • {quest.rewardXp} XP
            </Typography>
          )}

          {quest.rewardGold && quest.rewardGold > 0 && (
            <Typography variant="body2" className="!text-gray-700 !ml-4">
              • {quest.rewardGold} Gold
            </Typography>
          )}

          {quest.rewardItemId && (
            <Typography variant="body2" className="!text-gray-700 !ml-4">
              • Special Item
            </Typography>
          )}
        </div>
        {/* If no rewards */}
        {!(quest.rewardXp || quest.rewardGold || quest.rewardItemId) && (
          <Typography variant="body2" className="!text-gray-700 !mt-4">
            Please contact a Game Master for more details about rewards.
          </Typography>
        )}
        <Typography
          variant="caption"
          className="!text-gray-600 !mt-4 !block !text-right !italic"
        >
          — {quest.questGiver}
        </Typography>
      </div>
    </div>
  );
}

export default QuestCard;
