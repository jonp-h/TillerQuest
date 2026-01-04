"use client";
import { securePostClient } from "@/lib/secureFetchClient";
import { Paper, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
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
    const result = await securePostClient<string>(
      `/notifications/${userId}/read`,
      { messageId: message.id },
    );

    console.log(JSON.stringify(result));

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
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
