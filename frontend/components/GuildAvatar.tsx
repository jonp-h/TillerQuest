import { Avatar } from "@mui/material";
import { SxProps, Theme } from "@mui/system";

function GuildAvatar({
  guild,
  variant = "rounded",
  sx = {
    width: 150,
    height: 150,
    fontSize: "2rem",
    fontWeight: "bold",
    bgcolor: "purple.900",
  },
}: {
  guild: { name: string; icon?: string | null };
  variant?: "circular" | "rounded" | "square";
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Avatar
      variant={variant}
      sx={sx}
      src={
        guild.icon
          ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/static/guilds/${guild.icon}`
          : undefined
      }
    >
      {guild.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}

export default GuildAvatar;
