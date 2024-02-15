"use client";
import UserSelect from "@/components/ui/UserSelect";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useState } from "react";

export default function Aid() {
  const [selectedUserId, setSelectedUserId] = useState("128969752");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col items-center text-center gap-6">
          <h1 className=" text-4xl">Aid</h1>
          <h2 className="text-2xl">
            Type: <span className="text-green-400">Heal</span>
          </h2>
          <h2 className="text-2xl ">
            Cost: <span className="text-blue-400">2 mana</span>
          </h2>
          <p className="text-lg max-w-md">
            Choose a clan member to heal for a total of 4 health points. Grants
            the caster 20 experience points.
          </p>
          <UserSelect
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          />
          <Button variant="contained" size="large" color="primary">
            Cast
          </Button>
        </div>
      </div>
    </main>
  );
}
