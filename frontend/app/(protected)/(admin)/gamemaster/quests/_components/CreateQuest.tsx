"use client";
import DialogButton from "@/components/DialogButton";
import { securePostClient } from "@/lib/secureFetchClient";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function CreateQuest() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [rewardXp, setRewardXp] = useState<number>(0);
  const [rewardItemId, setRewardItemId] = useState<string>("");
  const [rewardGold, setRewardGold] = useState<number>(0);
  const [questGiver, setQuestGiver] = useState<string>("");

  const router = useRouter();

  const handleCreate = async () => {
    if (!name || !questGiver) {
      toast.error("Name and quest giver cannot be empty.");
      return;
    }

    const result = await securePostClient<string>(`/admin/quests`, {
      name,
      rewardXp,
      description,
      rewardItemId,
      rewardGold,
      questGiver,
    });

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
      return;
    }

    // Reset form after successful creation
    setName("");
    setDescription("");
    setRewardXp(0);
    setRewardItemId("");
    setRewardGold(0);
    setQuestGiver("");
    router.refresh();
  };

  return (
    <>
      <TextField
        variant="standard"
        label="Name"
        sx={{ marginX: 1, width: "20%" }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter new quest name..."
      />
      <TextField
        variant="standard"
        label="Description"
        multiline
        sx={{ marginX: 1, width: "30%" }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter new quest description..."
      />
      <TextField
        variant="standard"
        label="Reward XP"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardXp}
        onChange={(e) => setRewardXp(Number(e.target.value))}
        placeholder="Enter new quest reward XP..."
      />
      <TextField
        variant="standard"
        label="Reward Item ID"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardItemId}
        onChange={(e) => setRewardItemId(e.target.value)}
        placeholder="Enter new quest reward item ID..."
      />
      <TextField
        variant="standard"
        label="Reward Gold"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardGold}
        onChange={(e) => setRewardGold(Number(e.target.value))}
        placeholder="Enter new quest reward gold..."
      />
      <TextField
        variant="standard"
        label="Quest Giver"
        sx={{ marginX: 1, width: "20%" }}
        value={questGiver}
        onChange={(e) => setQuestGiver(e.target.value)}
        placeholder="Enter quest giver name..."
      />

      <DialogButton
        buttonText="Create"
        dialogTitle="Create New Quest"
        dialogContent={"Are you sure you want to create this quest?"}
        agreeText="Create"
        disagreeText="Cancel"
        buttonVariant="contained"
        dialogFunction={handleCreate}
        disabled={!name.trim() || !questGiver.trim()}
      />
    </>
  );
}

export default CreateQuest;
