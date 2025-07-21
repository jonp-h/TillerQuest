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
import { voteForWish } from "@/data/wish/wish";
import { Circle } from "@mui/icons-material";

function WishCard({
  userId,
  wish,
}: {
  userId: string;
  wish: {
    wishVotes: {
      userId: string;
      amount: number;
      username: string;
    }[];
  } & {
    image: string | null;
    id: number;
    name: string;
    value: number;
    description: string | null;
    scheduled: Date | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [anonymous, setAnonymous] = useState(false);

  const router = useRouter();

  const handleWish = async (amount: number) => {
    toast.promise(voteForWish(wish.id, userId, amount, anonymous), {
      pending: "Processing...",
      success: {
        render({ data }) {
          return data;
        },
      },
      error: {
        render({ data }) {
          return data instanceof Error
            ? `${data.message}`
            : "An error occurred while setting the daily cosmic.";
        },
      },
    });
    setOpen(false);
    router.refresh();
  };

  return (
    <Card sx={{ maxWidth: 400, position: "relative" }} elevation={4}>
      {wish.scheduled && (
        <div className="absolute top-0 right-0 z-10">
          <div className="w-0 h-0 border-l-[80px] border-l-transparent border-t-[80px] border-t-purple-600 relative">
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
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {wish.name}
        </Typography>
        <Typography variant="body1">Votes: {wish.value}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {wish.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" fullWidth onClick={() => setOpen(true)}>
          Vote
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-4 p-4">
            <Image
              src="/wish.png"
              alt="Wishing Well"
              width={250}
              height={250}
              className="mx-auto rounded-full"
            />
            {wish.scheduled && (
              <Typography variant="h6" align="center" color="secondary">
                Scheduled for {wish.scheduled.toLocaleDateString()}
              </Typography>
            )}
            <Typography variant="h6">
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
                inputProps={{ min: 1 }}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                }}
              />
              <Button variant="contained" onClick={() => handleWish(amount)}>
                Throw gold
              </Button>
            </div>

            <Typography
              variant="h5"
              align="center"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Voting history:
            </Typography>
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
                wish.wishVotes.map((vote) => (
                  <ListItem
                    key={vote.userId}
                    className="flex flex-col items-center"
                  >
                    <Typography align="center" variant="body1" color="gold">
                      <strong className="text-white">{vote.username}</strong>:{" "}
                      {vote.amount}{" "}
                      <Circle fontSize="small" sx={{ color: "gold" }} />
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  No votes yet.
                </Typography>
              )}
            </List>
          </div>
        </Dialog>
      </CardActions>
    </Card>
  );
}

export default WishCard;
