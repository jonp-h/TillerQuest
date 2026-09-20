import { Button, Link as MUILink, Typography } from "@mui/material";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="flex flex-col w-full py-5 gap-2 items-center bg-background">
      <Link href="/guide">
        <Button variant="text" color="info" size="small">
          Guidebook
        </Button>
      </Link>
      <Typography variant="subtitle1">
        Want a feature? Found a bug? Report issue {""}
        <MUILink
          color="error"
          variant="subtitle1"
          underline="hover"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jonp-h/TillerQuest/issues/new/choose"
        >
          here 🪲
        </MUILink>
      </Typography>

      <Typography variant="subtitle1">
        Made with ☕ by{" "}
        <MUILink
          color="info"
          variant="subtitle1"
          underline="hover"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jonp-h"
        >
          jonp-h
        </MUILink>{" "}
        and students at Tiller vgs
      </Typography>
      <Typography variant="subtitle2" color="textSecondary">
        2026
      </Typography>
    </div>
  );
}
