"use client";
import DialogButton from "@/components/DialogButton";
import { adminCreateSystemMessage } from "@/data/admin/systemMessages";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function CreateSystemMessageForm() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const router = useRouter();

  const handleCreate = async () => {
    if (!title || !content) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    toast.promise(adminCreateSystemMessage(title, content), {
      pending: "Creating system message...",
      success: "System message created successfully",
      error: {
        render({ data }) {
          return data instanceof Error
            ? `${data.message}`
            : "An error occurred while creating the system message.";
        },
      },
    });

    // Reset form after successful creation
    setTitle("");
    setContent("");
    router.refresh();
  };

  return (
    <>
      <TextField
        variant="standard"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter new message title..."
      />
      <TextField
        variant="standard"
        label="Content"
        multiline
        sx={{ marginX: 1, width: "80%" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter new message content..."
      />
      <DialogButton
        buttonText="Create"
        dialogTitle="Create New System Message"
        dialogContent={"Are you sure you want to create this system message?"}
        agreeText="Create"
        disagreeText="Cancel"
        buttonVariant="contained"
        dialogFunction={handleCreate}
        disabled={!title.trim() || !content.trim()}
      />
    </>
  );
}

export default CreateSystemMessageForm;
