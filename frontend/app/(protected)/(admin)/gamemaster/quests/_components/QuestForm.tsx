"use client";
import DialogButton from "@/components/DialogButton";
import { securePatchClient, secureDeleteClient } from "@/lib/secureFetchClient";
import { TextField, Typography } from "@mui/material";
import { Quest } from "@tillerquest/prisma/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function QuestForm({ quest }: { quest: Quest }) {
  const [name, setName] = useState<string | null>(quest.name);
  const [description, setDescription] = useState<string | null>(
    quest.description,
  );
  const [rewardXp, setRewardXp] = useState<string>(
    quest.rewardXp?.toString() ?? "",
  );
  const [rewardItemId, setRewardItemId] = useState<string>(
    quest.rewardItemId?.toString() ?? "",
  );
  const [rewardGold, setRewardGold] = useState<string>(
    quest.rewardGold?.toString() ?? "",
  );
  const [questGiver, setQuestGiver] = useState<string | null>(quest.questGiver);

  const router = useRouter();

  const handleUpdate = async () => {
    if (!name || !questGiver) {
      toast.error("Name and quest giver cannot be empty.");
      return;
    }

    const result = await securePatchClient<string>(
      `/admin/quests/${quest.id}`,
      {
        name,
        description,
        rewardXp: rewardXp === "" ? null : rewardXp,
        rewardItemId: rewardItemId === "" ? null : rewardItemId,
        rewardGold: rewardGold === "" ? null : rewardGold,
        questGiver,
      },
    );
    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleDelete = async () => {
    const result = await secureDeleteClient<string>(
      `/admin/quests/${quest.id}`,
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  return (
    <>
      <TextField
        variant="standard"
        sx={{ marginX: 1, width: "10%" }}
        label="Name"
        value={name ?? ""}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        variant="standard"
        multiline
        label="Description"
        type="text"
        sx={{ marginX: 1, width: "30%" }}
        value={description ?? ""}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Reward XP"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardXp}
        onChange={(e) => setRewardXp(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Reward Item ID"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardItemId}
        onChange={(e) => setRewardItemId(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Reward Gold"
        sx={{ marginX: 1, width: "10%" }}
        value={rewardGold}
        onChange={(e) => setRewardGold(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Quest Giver"
        type="text"
        sx={{ marginX: 1, width: "20%" }}
        value={questGiver ?? ""}
        onChange={(e) => setQuestGiver(e.target.value)}
      />
      <Typography variant="caption" color="textSecondary" align="center">
        Created at: <br />
        {new Date(quest.createdAt).toLocaleString()}
      </Typography>
      <div className="flex flex-col justify-between pl-2 gap-2">
        <DialogButton
          buttonText="Update"
          dialogTitle={"Update: " + quest.name}
          dialogContent={"Are you sure you want to update this quest?"}
          agreeText="Update"
          disagreeText="Cancel"
          buttonVariant="contained"
          disabled={!name?.trim() || !questGiver?.trim()}
          dialogFunction={handleUpdate}
        />
        <DialogButton
          buttonText="Delete"
          dialogTitle={"Delete: " + quest.name}
          dialogContent={"Are you sure you want to delete this quest?"}
          color="error"
          agreeText="Delete"
          disagreeText="Cancel"
          buttonVariant="contained"
          dialogFunction={handleDelete}
        />
      </div>
    </>
  );
}

export default QuestForm;
