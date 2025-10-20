"use client";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";

function BackButton() {
  const router = useRouter();
  return (
    <div>
      <ArrowBack
        onClick={() => router.back()}
        sx={{
          fontSize: "3rem",
          ":hover": { color: "white", cursor: "pointer" },
          color: "grey",
        }}
        className="cursor-pointer"
      />
    </div>
  );
}

export default BackButton;
