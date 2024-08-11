"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { Casino } from "@mui/icons-material";
import { User } from "@prisma/client";
import { resurrectUsers } from "@/data/admin";

export default function DeathCard({ user }: { user: User }) {
  const handleRessurect = async () => {
    resurrectUsers({ id: user.id });
  };

  return (
    <Card sx={{ display: "flex" }}>
      <Paper elevation={6} className="flex">
        <CardMedia
          component="img"
          sx={{ width: 151, borderRadius: "999px" }}
          image={"/classes/" + user.image + ".jpg"}
          alt={user.username ?? "user"}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Typography component="div" variant="h5">
              {user.name} {user.username} {user.lastname}
            </Typography>
            <Typography
              className="rounded-full"
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Level: {user.level}
            </Typography>
          </CardContent>
          <div className="flex flex-col items-center px-2 gap-2">
            <Button variant="contained" color="error" onClick={handleRessurect}>
              Temp resurrect
            </Button>
            <Button
              variant="contained"
              color="error"
              endIcon={<Casino />}
              disabled={true}
            >
              Death Save
            </Button>
          </div>
        </Box>
      </Paper>
    </Card>
  );
}
