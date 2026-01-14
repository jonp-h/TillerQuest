import { Game } from "@tillerquest/prisma/browser";
import { PrismaTransaction } from "types/prismaTransaction.js";

export const updateWordQuestGame = async (
  db: PrismaTransaction,
  userId: string,
  score: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>,
  game: Game,
  data: number[],
) => {
  // Use the game's existing metadata, not the empty metadata parameter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let metadataObj: any = game.metadata;
  if (typeof metadataObj === "string") {
    try {
      metadataObj = JSON.parse(metadataObj);
    } catch {
      metadataObj = {};
    }
  }

  const words = metadataObj?.words ?? [];
  const foundWords: string[] = metadataObj?.foundWords ?? [];
  const hintPenalties = metadataObj?.hintPenalties ?? 0; // Track total hint penalties

  // Check if the selected indices match any word
  for (const wordObj of words) {
    const wordIndices = wordObj.indices;

    // Sort both arrays to compare regardless of selection order
    const sortedWordIndices = [...wordIndices].sort((a, b) => a - b);
    const sortedDataIndices = [...data].sort((a, b) => a - b);

    // Check if arrays are equal
    if (
      sortedWordIndices.length === sortedDataIndices.length &&
      sortedWordIndices.every((idx, i) => idx === sortedDataIndices[i])
    ) {
      // Only add if not already found
      if (!foundWords.includes(wordObj.word)) {
        foundWords.push(wordObj.word);
      }
      break;
    }
  }

  // Calculate total score: 65 points per found word minus hint penalties
  score = foundWords.length * 65 - hintPenalties;

  // Return the updated metadata with all existing data preserved
  metadata = { ...metadataObj, foundWords, hintPenalties };

  return { score, metadata };
};
