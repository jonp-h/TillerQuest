import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

interface AbilityProps {
  ability: {
    icon: string | null;
    name: string;
  };
}

export default function AbilityCard({ ability }: AbilityProps) {
  return (
    <div className="flex flex-col justify-center" key={ability?.name}>
      <Link href={"/abilities/" + ability?.name} passHref>
        <div className="flex flex-col items-center text-center gap-2">
          <Paper
            elevation={10}
            sx={{
              minHeight: "6rem",
              minWidth: "6rem",
              borderRadius: "9999px",
              transition: "transform 0.3s ease-in-out",
            }}
            className="flex flex-col justify-center text-center items-center p-2 hover:scale-110"
          >
            <Image
              className="rounded-full "
              src={"/abilities/" + ability?.icon}
              alt={""}
              draggable={false}
              width={100}
              height={100}
            />
          </Paper>
          <Typography variant="subtitle1">
            {ability?.name.replace(/-/g, " ")}
          </Typography>
        </div>
      </Link>
    </div>
  );
}
