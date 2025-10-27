"use client";

import { useState } from "react";
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
  Tooltip,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

interface AbilityBalance {
  abilityId: number;
  name: string;
  category: string;
  gemstoneCost: number;
  duration: number | null;
  timesUsed: number;
  uniqueUsers: number;
  avgUsesPerDayPerUser: number;
  maxUsesPerDay: number;
  avgXpGained: number;
  avgManaCost: number;
  avgHealthCost: number;
  avgResourceCost: number;
  xpPerResource: number;
  xpPerDayPerUser: number;
  theoreticalMaxXpPerDay: number;
  xpPerGemstonePerDay: number;
  balanceScore: number;
  targetXpPerDay: number;
  isPermanent: boolean;
  isOverpowered: boolean;
  isUnderpowered: boolean;
  isUnused: boolean;
}

interface Props {
  data: AbilityBalance[];
}

export default function AbilityBalanceReport({ data }: Props) {
  const [filter, setFilter] = useState<
    "all" | "overpowered" | "underpowered" | "unused"
  >("all");
  const [sortBy, setSortBy] = useState<"balance" | "usage" | "xpPerDay">(
    "balance",
  );

  // Filter data
  let filteredData = [...data];
  if (filter === "overpowered") {
    filteredData = data.filter((a) => a.isOverpowered);
  } else if (filter === "underpowered") {
    filteredData = data.filter((a) => a.isUnderpowered && !a.isUnused);
  } else if (filter === "unused") {
    filteredData = data.filter((a) => a.isUnused);
  }

  // Sort data
  if (sortBy === "balance") {
    filteredData.sort((a, b) => b.balanceScore - a.balanceScore);
  } else if (sortBy === "usage") {
    filteredData.sort((a, b) => b.timesUsed - a.timesUsed);
  } else if (sortBy === "xpPerDay") {
    filteredData.sort((a, b) => b.xpPerDayPerUser - a.xpPerDayPerUser);
  }

  // Get balance status
  const getBalanceStatus = (ability: AbilityBalance) => {
    if (ability.isUnused) {
      return {
        label: "UNUSED",
        color: "default" as const,
        icon: <InfoIcon fontSize="small" />,
      };
    }
    if (ability.isPermanent) {
      return {
        label: "PASSIVE",
        color: "info" as const,
        icon: <InfoIcon fontSize="small" />,
      };
    }
    if (ability.isOverpowered) {
      return {
        label: "OVERPOWERED",
        color: "error" as const,
        icon: <ErrorIcon fontSize="small" />,
      };
    }
    if (ability.isUnderpowered) {
      return {
        label: "WEAK",
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

  // Summary stats
  const overpoweredCount = data.filter((a) => a.isOverpowered).length;
  const underpoweredCount = data.filter(
    (a) => a.isUnderpowered && !a.isUnused,
  ).length;
  const unusedCount = data.filter((a) => a.isUnused).length;
  const balancedCount =
    data.length - overpoweredCount - underpoweredCount - unusedCount;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Ability Balance Report
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Duration-adjusted balance analysis. Balance Score: 1.0 = perfect,
          &gt;1.5 = overpowered, &lt;0.5 = underpowered
        </Typography>

        {/* Summary Stats */}
        <Box className="flex gap-4 my-4">
          <Chip
            icon={<CheckCircleIcon />}
            label={`${balancedCount} Balanced`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`${overpoweredCount} Overpowered`}
            color="error"
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`${underpoweredCount} Weak`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<InfoIcon />}
            label={`${unusedCount} Unused`}
            color="default"
            variant="outlined"
          />
        </Box>

        {/* Filters */}
        <Box className="flex gap-4 mb-4">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Abilities ({data.length})</MenuItem>
              <MenuItem value="overpowered">
                Overpowered ({overpoweredCount})
              </MenuItem>
              <MenuItem value="underpowered">
                Underpowered ({underpoweredCount})
              </MenuItem>
              <MenuItem value="unused">Unused ({unusedCount})</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="balance">Balance Score (High to Low)</MenuItem>
              <MenuItem value="xpPerDay">XP/Day (High to Low)</MenuItem>
              <MenuItem value="usage">Usage (High to Low)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Ability</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Gems</strong>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Duration in minutes">
                    <span>
                      <strong>Duration</strong>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Times ability was used">
                    <span>
                      <strong>Uses</strong>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Average XP gained per day per user (KEY METRIC)">
                    <span>
                      <strong>XP/Day</strong>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Target XP/day for this gem tier">
                    <span>
                      <strong>Target</strong>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Balance Score: actual/target (1.0 = perfect). Also factors in duration">
                    <span>
                      <strong>Score</strong>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="XP gained per resource (mana+health) spent">
                    <span>
                      <strong>XP/Res</strong>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((ability) => {
                const status = getBalanceStatus(ability);
                return (
                  <TableRow
                    key={ability.abilityId}
                    sx={{
                      backgroundColor: ability.isOverpowered
                        ? "rgba(211, 47, 47, 0.1)"
                        : ability.isUnderpowered
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
                      <strong>{ability.name}</strong>
                    </TableCell>
                    <TableCell>{ability.category}</TableCell>
                    <TableCell align="center">{ability.gemstoneCost}</TableCell>
                    <TableCell align="center">
                      {ability.duration === null
                        ? "∞"
                        : ability.duration === 0
                          ? "Instant"
                          : `${ability.duration}m`}
                    </TableCell>
                    <TableCell align="center">
                      {ability.timesUsed} ({ability.uniqueUsers} users)
                    </TableCell>
                    <TableCell align="center">
                      <strong
                        style={{
                          color: ability.isOverpowered
                            ? "#d32f2f"
                            : ability.isUnderpowered
                              ? "#ed6c02"
                              : "#2e7d32",
                        }}
                      >
                        {ability.xpPerDayPerUser.toFixed(1)}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      {ability.targetXpPerDay.toFixed(1)}
                    </TableCell>
                    <TableCell align="center">
                      <strong
                        style={{
                          color:
                            ability.balanceScore > 1.5
                              ? "#d32f2f"
                              : ability.balanceScore < 0.5
                                ? "#ed6c02"
                                : "#2e7d32",
                        }}
                      >
                        {ability.balanceScore > 0
                          ? ability.balanceScore.toFixed(2)
                          : "N/A"}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      {ability.xpPerResource.toFixed(2)}
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
