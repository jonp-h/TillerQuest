"use client";
import { adminDeleteGuildEnemies } from "@/data/admin/adminUserInteractions";
import { Button, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface DungeonsFormProps {
  dungeonInfo: {
    name: string;
    enemies: {
      id: string;
      name: string;
      icon: string;
      xp: number;
      gold: number;
      health: number;
      attack: number;
    }[];
  };
}

function DungeonsForm({ dungeonInfo }: DungeonsFormProps) {
  const router = useRouter();

  const handleDeleteEnemies = async () => {
    const result = await adminDeleteGuildEnemies(dungeonInfo.name);
    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#fff",
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        {dungeonInfo.name}
      </Typography>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {dungeonInfo.enemies.map((enemy) => (
          <div
            key={enemy.id}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#1e293b",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 1px 6px rgba(80,0,120,0.15)",
              gap: "1.25rem",
            }}
          >
            <Image
              src={enemy.icon}
              alt={enemy.name}
              width={56}
              height={56}
              style={{
                borderRadius: "50%",
                border: "2px solid #a78bfa",
                background: "#2e1065",
              }}
            />
            <div style={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ color: "#fff", fontWeight: 600, mb: 0.5 }}
              >
                {enemy.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#a78bfa", fontSize: "0.95rem" }}
              >
                XP: {enemy.xp} &nbsp;|&nbsp; Gold: {enemy.gold} &nbsp;|&nbsp;
                Health: {enemy.health} &nbsp;|&nbsp; Attack: {enemy.attack}
              </Typography>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteEnemies}
        sx={{
          mt: 4,
          fontWeight: 700,
          background: "linear-gradient(90deg,#a78bfa,#7c3aed)",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
          borderRadius: "0.75rem",
        }}
      >
        Delete All Enemies
      </Button>
    </div>
  );
}

export default DungeonsForm;
