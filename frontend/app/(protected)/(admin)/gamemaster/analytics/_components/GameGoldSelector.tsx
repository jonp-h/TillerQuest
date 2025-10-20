"use client";

import { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

type TimePeriod = "today" | "week" | "twoWeeks";
type MetricType = "totalGold" | "avgGoldPerGame" | "gameCount";
type GroupType = "overall" | "byGame" | "byUser" | "byClass" | "byGuild";

interface GameGoldData {
  today: {
    overall: {
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    };
    byGame: Array<{
      gameName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byUser: Array<{
      userId: string;
      username: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byClass: Array<{
      class: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
  };
  week: {
    overall: {
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    };
    byGame: Array<{
      gameName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byUser: Array<{
      userId: string;
      username: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byClass: Array<{
      class: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
  };
  twoWeeks: {
    overall: {
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    };
    byGame: Array<{
      gameName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byUser: Array<{
      userId: string;
      username: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byClass: Array<{
      class: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      totalGold: number;
      avgGoldPerGame: number;
      gameCount: number;
    }>;
  };
}

interface GameGoldSelectorProps {
  data: GameGoldData;
}

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "twoWeeks", label: "Last 14 Days" },
];

const metricOptions = [
  { value: "totalGold", label: "Total Gold Earned", color: "#f59e0b" },
  { value: "avgGoldPerGame", label: "Average Gold per Game", color: "#d97706" },
  { value: "gameCount", label: "Games Played", color: "#92400e" },
];

const groupOptions = [
  { value: "overall", label: "Overall Total" },
  { value: "byGame", label: "By Game Type" },
  { value: "byUser", label: "By User" },
  { value: "byClass", label: "By Class" },
  { value: "byGuild", label: "By Guild" },
];

export default function GameGoldSelector({ data }: GameGoldSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>("avgGoldPerGame");
  const [selectedGroup, setSelectedGroup] = useState<GroupType>("byUser");

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value as TimePeriod);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as MetricType);
  };

  const handleGroupChange = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value as GroupType);
  };

  const getChartData = () => {
    const periodData = data[selectedPeriod];

    if (selectedGroup === "overall") {
      const value = periodData.overall[selectedMetric];
      return {
        xAxisData: ["Overall"],
        seriesData: [Math.round(value * 100) / 100], // Round to 2 decimal places
      };
    } else if (selectedGroup === "byGame") {
      const games = periodData.byGame
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .slice(0, 15); // Top 15 games
      return {
        xAxisData: games.map((g) => g.gameName),
        seriesData: games.map((g) => Math.round(g[selectedMetric] * 100) / 100),
      };
    } else if (selectedGroup === "byUser") {
      const users = periodData.byUser
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .slice(0, 15); // Top 15 users
      return {
        xAxisData: users.map((u) => u.username),
        seriesData: users.map((u) => Math.round(u[selectedMetric] * 100) / 100),
      };
    } else if (selectedGroup === "byClass") {
      const classes = periodData.byClass.sort(
        (a, b) => b[selectedMetric] - a[selectedMetric],
      );
      return {
        xAxisData: classes.map((c) => c.class),
        seriesData: classes.map(
          (c) => Math.round(c[selectedMetric] * 100) / 100,
        ),
      };
    } else {
      const guilds = periodData.byGuild.sort(
        (a, b) => b[selectedMetric] - a[selectedMetric],
      );
      return {
        xAxisData: guilds.map((g) => g.guildName),
        seriesData: guilds.map(
          (g) => Math.round(g[selectedMetric] * 100) / 100,
        ),
      };
    }
  };

  const chartData = getChartData();
  const periodLabel = timePeriodOptions.find(
    (option) => option.value === selectedPeriod,
  )?.label;
  const metricLabel = metricOptions.find(
    (option) => option.value === selectedMetric,
  )?.label;
  const groupLabel = groupOptions.find(
    (option) => option.value === selectedGroup,
  )?.label;
  const metricColor = metricOptions.find(
    (option) => option.value === selectedMetric,
  )?.color;

  return (
    <div className="w-full">
      <Typography variant="h6" align="center" gutterBottom>
        Game Gold Analytics
      </Typography>

      <div className="flex gap-4 mb-4 justify-center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="period-select-label">Time Period</InputLabel>
          <Select
            labelId="period-select-label"
            value={selectedPeriod}
            label="Time Period"
            onChange={handlePeriodChange}
          >
            {timePeriodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="metric-select-label">Metric</InputLabel>
          <Select
            labelId="metric-select-label"
            value={selectedMetric}
            label="Metric"
            onChange={handleMetricChange}
          >
            {metricOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="group-select-label">Group By</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup}
            label="Group By"
            onChange={handleGroupChange}
          >
            {groupOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <BarChart
        xAxis={[
          {
            id: "gameGoldCategories",
            data: chartData.xAxisData,
          },
        ]}
        series={[
          {
            data: chartData.seriesData,
            label: `${metricLabel} ${groupLabel} (${periodLabel})`,
            color: metricColor,
          },
        ]}
        height={300}
      />
    </div>
  );
}
