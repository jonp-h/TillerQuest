"use client";
import { Typography, Paper, Box, Avatar, Chip } from "@mui/material";
import { $Enums } from "@prisma/client";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";

function GuildLeaderboard({
  guilds,
}: {
  guilds: {
    name: string;
    schoolClass: $Enums.SchoolClass | null;
    level: number;
    icon: string | null;
  }[];
}) {
  // Sort guilds by level in descending order
  const sortedGuilds = [...guilds].sort((a, b) => b.level - a.level);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <EmojiEventsIcon sx={{ color: "#FFD700", fontSize: 28 }} />; // Gold
      case 2:
        return <EmojiEventsIcon sx={{ color: "#C0C0C0", fontSize: 24 }} />; // Silver
      case 3:
        return <EmojiEventsIcon sx={{ color: "#CD7F32", fontSize: 22 }} />; // Bronze
      default:
        return (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "purple.900",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid",
              borderColor: "purple.500",
            }}
          >
            <Typography variant="caption" fontWeight="bold" color="white">
              {position}
            </Typography>
          </Box>
        );
    }
  };

  const getSchoolClassDisplay = (schoolClass: $Enums.SchoolClass | null) => {
    if (!schoolClass) return null;
    return schoolClass.replace("Class_", "").replace("_", " ");
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col mt-10 p-6 gap-4 w-full mx-auto lg:w-3/4 xl:w-2/3"
      sx={{ backgroundColor: "background.paper", borderRadius: 2 }}
    >
      <Box className="text-center mb-4">
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ color: "purple.400", fontWeight: "bold" }}
        >
          🏆 Guild Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Top guilds ranked by level
        </Typography>
      </Box>

      <Box className="flex flex-col gap-3">
        {sortedGuilds.map((guild, index) => {
          const position = index + 1;
          return (
            <Paper
              key={guild.name}
              elevation={position <= 3 ? 8 : 2}
              sx={{
                p: 3,
                backgroundColor:
                  position <= 3 ? "purple.900" : "background.default",
                border: position <= 3 ? "2px solid" : "1px solid",
                borderColor: position <= 3 ? "purple.500" : "grey.700",
                borderRadius: 2,
              }}
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-4">
                  {/* Rank */}
                  <Box className="flex items-center justify-center min-w-[40px]">
                    {getRankIcon(position)}
                  </Box>
                  {/* Guild Icon */}
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                    src={guild.icon ? `/guilds/${guild.icon}.png` : undefined}
                  >
                    {guild.name.charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Guild Info */}
                  <Box className="flex flex-col gap-1">
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: "bold",
                        color: position <= 3 ? "white" : "text.primary",
                      }}
                    >
                      {guild.name}
                    </Typography>

                    {guild.schoolClass && (
                      <Box className="flex items-center gap-1">
                        <SchoolIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Chip
                          label={getSchoolClassDisplay(guild.schoolClass)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.75rem",
                            height: 24,
                            borderColor:
                              position <= 3 ? "purple.300" : "grey.600",
                            color:
                              position <= 3 ? "purple.200" : "text.secondary",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Level Display */}
                <Box className="text-right">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Level
                  </Typography>
                  <Typography
                    variant="h5"
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      color: position <= 3 ? "white" : "purple.400",
                    }}
                  >
                    {guild.level}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {sortedGuilds.length === 0 && (
        <Box className="text-center py-8">
          <Typography variant="body1" color="text.secondary">
            No guilds found
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default GuildLeaderboard;
