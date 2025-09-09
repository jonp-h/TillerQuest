"use client";
import DialogButton from "@/components/DialogButton";
import {
  adminDeleteSystemMessage,
  adminUpdateSystemMessage,
} from "@/data/admin/systemMessages";
import { TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function SystemMessageForm(message: {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  readCount: number;
  totalUserCount: number;
}) {
  const [title, setTitle] = useState<string | null>(message.title);
  const [content, setContent] = useState<string | null>(message.content);

  const router = useRouter();

  const handleUpdate = async () => {
    if (!title || !content) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    const result = await adminUpdateSystemMessage(message.id, title, content);
    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleDelete = async () => {
    const result = await adminDeleteSystemMessage(message.id);

    if (result.success) {
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
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        variant="standard"
        multiline
        label="Content"
        type="text"
        sx={{ marginX: 1, width: "70%" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Typography variant="caption" color="textSecondary" align="center">
        Created at: <br />
        {new Date(message.createdAt).toLocaleString()}
      </Typography>
      <Typography variant="caption" color="textSecondary" align="center">
        Dismissed by: <br />
        {message.readCount}/{message.totalUserCount} users
      </Typography>
      <div className="flex flex-col justify-between pl-2 gap-2">
        <DialogButton
          buttonText="Update"
          dialogTitle={"Update: " + message.title}
          dialogContent={
            "Are you sure you want to update this message to all users?"
          }
          agreeText="Update"
          disagreeText="Cancel"
          buttonVariant="contained"
          disabled={!title?.trim() || !content?.trim()}
          dialogFunction={handleUpdate}
        />
        <DialogButton
          buttonText="Delete"
          dialogTitle={"Delete: " + message.title}
          dialogContent={"Are you sure you want to delete this message?"}
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

export default SystemMessageForm;
