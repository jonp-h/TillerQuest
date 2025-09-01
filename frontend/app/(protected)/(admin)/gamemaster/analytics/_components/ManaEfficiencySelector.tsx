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
  | "xpPerResource"
  | "xpPerMana"
  | "xpPerHealth"
  | "avgResourceCost"
  | "avgManaCost"
  | "avgHealthCost"
  | "avgXpGain";
type GroupType = "overall" | "byAbility" | "byCategory" | "byClass" | "byGuild";

interface AbilityEfficiencyData {
  today: {
    overall: {
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    };
    byAbility: Array<{
      abilityId: number;
      ability: { name: string; category: string } | null;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byCategory: Array<{
      category: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byClass: Array<{
      class: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
  };
  week: {
    overall: {
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    };
    byAbility: Array<{
      abilityId: number;
      ability: { name: string; category: string } | null;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byCategory: Array<{
      category: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byClass: Array<{
      class: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
  };
  twoWeeks: {
    overall: {
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    };
    byAbility: Array<{
      abilityId: number;
      ability: { name: string; category: string } | null;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byCategory: Array<{
      category: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byClass: Array<{
      class: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpPerResource: number;
      xpPerMana: number;
      xpPerHealth: number;
      avgResourceCost: number;
      avgManaCost: number;
      avgHealthCost: number;
      avgXpGain: number;
      usageCount: number;
    }>;
  };
}

interface AbilityEfficiencySelectorProps {
  data: AbilityEfficiencyData;
}

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "twoWeeks", label: "Last 14 Days" },
];

const metricOptions = [
  {
    value: "xpPerResource",
    label: "XP per Resource (Mana + Health)",
    color: "#8b5cf6",
  },
  { value: "xpPerMana", label: "XP per Mana", color: "#3b82f6" },
  { value: "xpPerHealth", label: "XP per Health", color: "#dc2626" },
  {
    value: "avgResourceCost",
    label: "Average Resource Cost",
    color: "#f59e0b",
  },
  { value: "avgManaCost", label: "Average Mana Cost", color: "#06b6d4" },
  { value: "avgHealthCost", label: "Average Health Cost", color: "#ef4444" },
  { value: "avgXpGain", label: "Average XP Gain", color: "#10b981" },
];

const groupOptions = [
  { value: "overall", label: "Overall Average" },
  { value: "byAbility", label: "By Ability" },
  { value: "byCategory", label: "By Category" },
  { value: "byClass", label: "By Class" },
  { value: "byGuild", label: "By Guild" },
];

export default function ManaEfficiencySelector({
  data,
}: AbilityEfficiencySelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>("xpPerResource");
  const [selectedGroup, setSelectedGroup] = useState<GroupType>("byClass");

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
    } else if (selectedGroup === "byAbility") {
      const abilities = periodData.byAbility
        .filter((a) => a[selectedMetric] > 0) // Filter out zero values for cleaner display
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .slice(0, 15); // Top 15 abilities
      return {
        xAxisData: abilities.map((a) => a.ability?.name || "Unknown"),
        seriesData: abilities.map(
          (a) => Math.round(a[selectedMetric] * 100) / 100,
        ),
      };
    } else if (selectedGroup === "byCategory") {
      const categories = periodData.byCategory
        .filter((c) => c[selectedMetric] > 0)
        .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
      return {
        xAxisData: categories.map((c) => c.category),
        seriesData: categories.map(
          (c) => Math.round(c[selectedMetric] * 100) / 100,
        ),
      };
    } else if (selectedGroup === "byClass") {
      const classes = periodData.byClass
        .filter((c) => c[selectedMetric] > 0)
        .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
      return {
        xAxisData: classes.map((c) => c.class),
        seriesData: classes.map(
          (c) => Math.round(c[selectedMetric] * 100) / 100,
        ),
      };
    } else {
      const guilds = periodData.byGuild
        .filter((g) => g[selectedMetric] > 0)
        .sort((a, b) => b[selectedMetric] - a[selectedMetric]);
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
        Ability Efficiency Analytics
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
            id: "abilityEfficiencyCategories",
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
