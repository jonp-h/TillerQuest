import MainContainer from "@/components/MainContainer";
import { getAllDeadUsers } from "@/data/admin";
import { Button, Typography } from "@mui/material";
import React from "react";
import DeathCard from "./_components/DeathCard";
import Image from "next/image";

export default async function ResurrectPage() {
  const deadUsers = await getAllDeadUsers();

  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center">
        <Image
          className="rounded-full"
          alt="deadly-gm"
          src="/deadly-gm.jpg"
          width={400}
          height={400}
        />
        <Typography variant="h3" align="center" color="error">
          Resurrect thou foolish students
        </Typography>
        <Typography variant="h5" align="center">
          But resurrection comes at a cost...
        </Typography>
      </div>
      <div>
        {deadUsers.map((user) => (
          <DeathCard key={user.name} user={user} />
        ))}
      </div>
    </MainContainer>
  );
}
