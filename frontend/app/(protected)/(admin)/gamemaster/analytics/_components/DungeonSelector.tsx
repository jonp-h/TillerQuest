"use client";

import React, { useState } from "react";
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
type MetricType =
  | "totalDamage"
  | "averageDamage"
  | "totalXp"
  | "totalGold"
  | "averageXp"
  | "averageGold"
  | "damageInstances"
  | "rewardInstances";

interface DungeonStats {
  guildName: string;
  totalDamage: number;
  averageDamage: number;
  damageInstances: number;
  totalXp: number;
  totalGold: number;
  averageXp: number;
  averageGold: number;
  rewardInstances: number;
}

interface DungeonData {
  today: DungeonStats[];
  week: DungeonStats[];
  twoWeeks: DungeonStats[];
}

interface DungeonSelectorProps {
  data: DungeonData;
}

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "twoWeeks", label: "Last 14 Days" },
];

const metricOptions = [
  { value: "totalDamage", label: "Total Damage Taken", color: "#dc2626" },
  {
    value: "averageDamage",
    label: "Average Damage per Event",
    color: "#b91c1c",
  },
  { value: "totalXp", label: "Total XP Earned", color: "#059669" },
  { value: "totalGold", label: "Total Gold Earned", color: "#f59e0b" },
  { value: "averageXp", label: "Average XP per Enemy", color: "#047857" },
  { value: "averageGold", label: "Average Gold per Enemy", color: "#d97706" },
  { value: "damageInstances", label: "Damage Events Count", color: "#7c2d12" },
  { value: "rewardInstances", label: "Enemies Defeated", color: "#065f46" },
];

export default function DungeonSelector({ data }: DungeonSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>("totalDamage");

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value as TimePeriod);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as MetricType);
  };

  const getChartData = () => {
    const periodData = data[selectedPeriod];

    // Sort guilds by the selected metric (descending)
    const sortedGuilds = periodData
      .filter((guild) => guild[selectedMetric] > 0) // Only show guilds with data
      .sort((a, b) => b[selectedMetric] - a[selectedMetric])
      .slice(0, 10); // Top 10 guilds

    return {
      xAxisData: sortedGuilds.map((guild) => guild.guildName),
      seriesData: sortedGuilds.map(
        (guild) => Math.round(guild[selectedMetric] * 100) / 100,
      ),
    };
  };

  const chartData = getChartData();
  const periodLabel = timePeriodOptions.find(
    (option) => option.value === selectedPeriod,
  )?.label;
  const metricLabel = metricOptions.find(
    (option) => option.value === selectedMetric,
  )?.label;
  const metricColor = metricOptions.find(
    (option) => option.value === selectedMetric,
  )?.color;

  return (
    <div className="w-full">
      <Typography variant="h6" align="center" gutterBottom>
        Dungeon Analytics
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

        <FormControl size="small" sx={{ minWidth: 200 }}>
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
      </div>

      {chartData.xAxisData.length === 0 ? (
        <Typography variant="body1" align="center" color="textSecondary">
          No dungeon activity found for the selected period.
        </Typography>
      ) : (
        <BarChart
          xAxis={[
            {
              id: "dungeonCategories",
              data: chartData.xAxisData,
            },
          ]}
          series={[
            {
              data: chartData.seriesData,
              label: `${metricLabel} by Guild (${periodLabel})`,
              color: metricColor,
            },
          ]}
          height={300}
        />
      )}
    </div>
  );
}
