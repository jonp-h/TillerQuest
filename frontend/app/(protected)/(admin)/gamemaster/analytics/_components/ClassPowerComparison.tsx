"use client";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ClassData {
  class: string;
  totalXp: number;
  totalGold: number;
  uniqueUsers: number;
  xpPerUserPerDay: number;
  goldPerUserPerDay: number;
  xpPowerScore: number;
  goldPowerScore: number;
  isOverpowered: boolean;
  isUnderpowered: boolean;
}

interface Props {
  data: {
    classes: ClassData[];
    averageXpPerDay: number;
    averageGoldPerDay: number;
  };
}

export default function ClassPowerComparison({ data }: Props) {
  const { classes, averageXpPerDay, averageGoldPerDay } = data;

  // Calculate distribution bar metrics
  const minXp = Math.min(...classes.map((c) => c.xpPerUserPerDay));
  const maxXp = Math.max(...classes.map((c) => c.xpPerUserPerDay));
  const xpRange = maxXp - minXp;

  // Calculate position on the distribution bar (0-100%)
  const getDistributionPosition = (xp: number) => {
    if (xpRange === 0) return 50; // All classes equal
    return ((xp - minXp) / xpRange) * 100;
  };

  // Get color based on power level
  const getDistributionColor = (powerScore: number) => {
    if (powerScore > 1.15) return "#ef4444"; // red (overpowered)
    if (powerScore < 0.85) return "#3b82f6"; // blue (underpowered)
    return "#22c55e"; // green (balanced)
  };

  const getBalanceStatus = (classData: ClassData) => {
    if (classData.isOverpowered) {
      return {
        label: "OVERPOWERED",
        color: "error" as const,
        icon: <ErrorIcon fontSize="small" />,
      };
    }
    if (classData.isUnderpowered) {
      return {
        label: "UNDERPOWERED",
        color: "warning" as const,
        icon: <WarningIcon fontSize="small" />,
      };
    }
    return {
      label: "BALANCED",
      color: "success" as const,
      icon: <CheckCircleIcon fontSize="small" />,
    };
  };

  const getColorForScore = (score: number) => {
    if (score > 1.15) return "#d32f2f"; // Red for overpowered
    if (score < 0.85) return "#ed6c02"; // Orange for underpowered
    return "#2e7d32"; // Green for balanced
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Class Power Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Classes should be within ±15% of each other. Power Score: 1.0 =
          average, &gt;1.15 = overpowered, &lt;0.85 = underpowered
        </Typography>

        {/* Average Stats */}
        <Box className="flex gap-4 my-4">
          <Chip
            label={`Average XP/Day: ${averageXpPerDay.toFixed(1)}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Average Gold/Day: ${averageGoldPerDay.toFixed(1)}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Class</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Users</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>XP/User/Day</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>XP Power Score</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Gold/User/Day</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Gold Power Score</strong>
                </TableCell>
                <TableCell>
                  <strong>XP Distribution</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((classData) => {
                const status = getBalanceStatus(classData);
                const xpScoreColor = getColorForScore(classData.xpPowerScore);
                const goldScoreColor = getColorForScore(
                  classData.goldPowerScore,
                );

                return (
                  <TableRow
                    key={classData.class}
                    sx={{
                      backgroundColor: classData.isOverpowered
                        ? "rgba(211, 47, 47, 0.1)"
                        : classData.isUnderpowered
                          ? "rgba(237, 108, 2, 0.1)"
                          : undefined,
                    }}
                  >
                    <TableCell>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <strong>{classData.class}</strong>
                    </TableCell>
                    <TableCell align="center">
                      {classData.uniqueUsers}
                    </TableCell>
                    <TableCell align="center">
                      <strong style={{ color: xpScoreColor }}>
                        {classData.xpPerUserPerDay.toFixed(1)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong style={{ color: xpScoreColor }}>
                        {classData.xpPowerScore.toFixed(2)}x
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong style={{ color: goldScoreColor }}>
                        {classData.goldPerUserPerDay.toFixed(1)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong style={{ color: goldScoreColor }}>
                        {classData.goldPowerScore.toFixed(2)}x
                      </strong>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={`${classData.class}: ${classData.xpPerUserPerDay.toFixed(1)} XP/day (${classData.xpPowerScore.toFixed(2)}x average). Position shows where this class ranks compared to others.`}
                        arrow
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            minWidth: 250,
                          }}
                        >
                          {/* Background bar with gradient zones */}
                          <Box
                            sx={{
                              position: "relative",
                              height: 32,
                              borderRadius: 1,
                              overflow: "hidden",
                              background:
                                "linear-gradient(to right, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 35%, rgba(34, 197, 94, 0.15) 35%, rgba(34, 197, 94, 0.15) 65%, rgba(239, 68, 68, 0.15) 65%, rgba(239, 68, 68, 0.15) 100%)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {/* Average line marker */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: "50%",
                                top: 0,
                                bottom: 0,
                                width: 2,
                                bgcolor: "rgba(255,255,255,0.5)",
                                zIndex: 2,
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                left: "50%",
                                top: -2,
                                transform: "translateX(-50%)",
                                fontSize: "9px",
                                fontWeight: "bold",
                                color: "rgba(255,255,255,0.7)",
                                bgcolor: "rgba(0,0,0,0.3)",
                                px: 0.5,
                                borderRadius: 0.5,
                              }}
                            >
                              AVG
                            </Box>

                            {/* Class position dot */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: `${getDistributionPosition(classData.xpPerUserPerDay)}%`,
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 20,
                                height: 20,
                                bgcolor: getDistributionColor(
                                  classData.xpPowerScore,
                                ),
                                borderRadius: "50%",
                                border: "3px solid white",
                                zIndex: 3,
                                boxShadow: `0 0 8px ${getDistributionColor(classData.xpPowerScore)}, 0 2px 4px rgba(0,0,0,0.3)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {/* Pulse animation for overpowered/underpowered */}
                              {(classData.isOverpowered ||
                                classData.isUnderpowered) && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    bgcolor: getDistributionColor(
                                      classData.xpPowerScore,
                                    ),
                                    animation: "pulse 2s ease-in-out infinite",
                                    "@keyframes pulse": {
                                      "0%, 100%": {
                                        opacity: 0.3,
                                        transform: "scale(1)",
                                      },
                                      "50%": {
                                        opacity: 0,
                                        transform: "scale(1.8)",
                                      },
                                    },
                                  }}
                                />
                              )}
                            </Box>

                            {/* Min/Max labels */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: 4,
                                bottom: 2,
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.5)",
                                fontWeight: "bold",
                              }}
                            >
                              {minXp.toFixed(0)}
                            </Box>
                            <Box
                              sx={{
                                position: "absolute",
                                right: 4,
                                bottom: 2,
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.5)",
                                fontWeight: "bold",
                              }}
                            >
                              {maxXp.toFixed(0)}
                            </Box>

                            {/* Zone labels */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: "17.5%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "8px",
                                color: "rgba(59, 130, 246, 0.7)",
                                fontWeight: "bold",
                              }}
                            >
                              WEAK
                            </Box>
                            <Box
                              sx={{
                                position: "absolute",
                                left: "50%",
                                bottom: 2,
                                transform: "translateX(-50%)",
                                fontSize: "8px",
                                color: "rgba(34, 197, 94, 0.7)",
                                fontWeight: "bold",
                              }}
                            >
                              BALANCED
                            </Box>
                            <Box
                              sx={{
                                position: "absolute",
                                right: "17.5%",
                                top: "50%",
                                transform: "translate(50%, -50%)",
                                fontSize: "8px",
                                color: "rgba(239, 68, 68, 0.7)",
                                fontWeight: "bold",
                              }}
                            >
                              STRONG
                            </Box>
                          </Box>

                          {/* Percentage indicator below bar */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "center",
                              mt: 0.5,
                              fontSize: "10px",
                              color: getDistributionColor(
                                classData.xpPowerScore,
                              ),
                              fontWeight: "bold",
                            }}
                          >
                            {classData.xpPowerScore > 1 ? "+" : ""}
                            {((classData.xpPowerScore - 1) * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
