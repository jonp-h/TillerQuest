"use client";
import { discardSystemMessage } from "@/data/messages/systemMessages";
import { Paper, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

interface SystemMessageProps {
  message: {
    id: number;
    title: string;
    content: string;
  };
  userId: string;
}

function SystemMessage({ message, userId }: SystemMessageProps) {
  const router = useRouter();

  const handleDiscard = async () => {
    toast.promise(discardSystemMessage(userId, message.id), {
      pending: "Discarding message...",
      success: {
        render({ data }) {
          return data;
        },
      },
      error: {
        render({ data }) {
          return data instanceof Error
            ? data.message
            : "An error occurred while discarding the message";
        },
      },
    });
    router.refresh();
  };
  return (
    <Paper
      key={message.id}
      elevation={6}
      className="m-3 p-5 flex flex-col gap-5 text-center justify-center"
      variant="outlined"
      sx={{
        backgroundColor: "salmon",
        textShadow: "2px 2px 2px black",
      }}
    >
      <Typography variant="h4" align="center">
        {message.title}
      </Typography>
      <Typography variant="h5" align="center">
        {message.content}
      </Typography>
      <div>
        <Button
          variant="contained"
          color="info"
          onClick={() => handleDiscard()}
        >
          Dismiss message
        </Button>
      </div>
    </Paper>
  );
}

export default SystemMessage;
