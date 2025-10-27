import { Link, Typography } from "@mui/material";

export default function Footer() {
  return (
    <div className="flex flex-col w-full py-5 gap-2 items-center bg-background">
      <Typography variant="subtitle1">
        Want a feature? Found a bug? Report issue {""}
        <Link
          color="error"
          variant="subtitle1"
          underline="hover"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jonp-h/TillerQuest/issues/new/choose"
        >
          here 🪲
        </Link>
      </Typography>
      <Typography variant="subtitle1">
        Made with ☕ by{" "}
        <Link
          color="info"
          variant="subtitle1"
          underline="hover"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jonp-h"
        >
          jonp-h
        </Link>{" "}
        and students at Tiller vgs
      </Typography>
      <Typography variant="subtitle2" color="textSecondary">
        2025
      </Typography>
    </div>
  );
}
