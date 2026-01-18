"use client";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Dialog,
  Input,
  Switch,
  List,
  ListItem,
} from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Circle } from "@mui/icons-material";
import { securePostClient } from "@/lib/secureFetchClient";
import { WishWithVotes } from "./types";

function WishCard({ userId, wish }: { userId: string; wish: WishWithVotes }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleWish = async (amount: number) => {
    // Client-side validation for better UX
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (amount > 10000) {
      toast.error("Amount must not exceed 10,000 gold");
      return;
    }

    setIsSubmitting(true);

    const result = await securePostClient<string>(`/wishes/${userId}/vote`, {
      wishId: wish.id,
      amount: amount,
      anonymous: anonymous,
    });

    setIsSubmitting(false);

    if (result.ok) {
      toast.success(result.data);
      setOpen(false);
      setAmount(0);
      router.refresh();
    } else {
      // Backend provides specific error messages
      toast.error(result.error);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        position: "relative",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      elevation={0}
    >
      {wish.scheduled && (
        <div className="absolute top-0 right-0 z-10">
          <div className="w-0 h-0 border-l-[80px] border-l-transparent border-t-[80px] border-t-red-700 relative">
            <span className="absolute -top-13 -right-9 rotate-45 text-white text-xs font-bold whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2">
              Scheduled
            </span>
          </div>
        </div>
      )}
      <CardMedia
        component="img"
        alt={wish.name}
        height="140"
        image={wish.image || "/abilities/Test.jpg"}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {wish.name}
        </Typography>
        <Typography variant="body1">Votes: {wish.value}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {wish.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          variant="text"
          color="inherit"
          fullWidth
          onClick={() => setOpen(true)}
        >
          Read More
        </Button>
      </CardActions>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-4 p-4">
          <Image
            src="/wishes/wish.png"
            alt="Wishing Well"
            width={250}
            height={250}
            className="mx-auto rounded-full"
          />
          <Typography gutterBottom variant="h4" align="center">
            {wish.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
            align="center"
          >
            {wish.description}
          </Typography>
          {wish.scheduled && (
            <Typography variant="h6" align="center" color="secondary">
              Scheduled for {new Date(wish.scheduled).toLocaleDateString()}
            </Typography>
          )}
          <Typography variant="h6" align="center">
            Enter the amount of gold to throw into the wishing well
          </Typography>
          <div className="flex justify-center text-wrap items-center gap-2">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {anonymous
                ? "I want to remain anonymous in the voting history"
                : "I want my username visible in the voting history"}
            </Typography>
            <Switch
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              color="primary"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Input
              placeholder="Enter amount"
              type="number"
              inputProps={{ min: 1, max: 10000 }}
              value={amount || ""}
              onChange={(e) => {
                setAmount(Number(e.target.value));
              }}
              disabled={isSubmitting}
            />
            <Button
              variant="contained"
              onClick={() => handleWish(amount)}
              disabled={isSubmitting || amount <= 0}
            >
              {isSubmitting ? "Throwing..." : "Throw gold"}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Typography
              variant="h5"
              align="center"
              sx={{ color: "text.secondary" }}
            >
              Voting history:
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Total: {wish.value}
            </Typography>
          </div>
          <List
            sx={{
              maxHeight: 200,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              overflow: "auto",
            }}
          >
            {wish.wishVotes.length > 0 ? (
              wish.wishVotes.map((vote, index) => (
                <ListItem key={index} className="flex flex-col items-center">
                  <Typography align="center" variant="body1" color="gold">
                    <strong className="text-white">{vote.user.username}</strong>
                    : {vote.amount}{" "}
                    <Circle fontSize="small" sx={{ color: "gold" }} />
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" align="center" color="text.secondary">
                No votes yet.
              </Typography>
            )}
          </List>
        </div>
      </Dialog>
    </Card>
  );
}

export default WishCard;
