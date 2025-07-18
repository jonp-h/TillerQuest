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
type ResourceType = "xp" | "gold" | "mana";
type GroupType = "overall" | "byUser" | "byClass" | "byGuild";

interface ResourceGainData {
  today: {
    overall: {
      xpChange: number;
      goldChange: number;
      manaChange: number;
    };
    byUser: Array<{
      userId: string;
      username: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byClass: Array<{
      class: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
  };
  week: {
    overall: {
      xpChange: number;
      goldChange: number;
      manaChange: number;
    };
    byUser: Array<{
      userId: string;
      username: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byClass: Array<{
      class: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
  };
  twoWeeks: {
    overall: {
      xpChange: number;
      goldChange: number;
      manaChange: number;
    };
    byUser: Array<{
      userId: string;
      username: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byClass: Array<{
      class: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
    byGuild: Array<{
      guildName: string;
      xpChange: number;
      goldChange: number;
      manaChange: number;
    }>;
  };
}

interface ResourceGainSelectorProps {
  data: ResourceGainData;
}

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "twoWeeks", label: "Last 14 Days" },
];

const resourceOptions = [
  { value: "xp", label: "Experience Points", color: "#8b5cf6" },
  { value: "gold", label: "Gold", color: "#f59e0b" },
  { value: "mana", label: "Mana", color: "#3b82f6" },
];

const groupOptions = [
  { value: "overall", label: "Overall Total" },
  { value: "byUser", label: "Gain By User" },
  { value: "byClass", label: "Gain By Class" },
  { value: "byGuild", label: "Gain By Guild" },
];

export default function ResourceGainSelector({
  data,
}: ResourceGainSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [selectedResource, setSelectedResource] = useState<ResourceType>("xp");
  const [selectedGroup, setSelectedGroup] = useState<GroupType>("byUser");

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value as TimePeriod);
  };

  const handleResourceChange = (event: SelectChangeEvent) => {
    setSelectedResource(event.target.value as ResourceType);
  };

  const handleGroupChange = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value as GroupType);
  };

  const getChartData = () => {
    const periodData = data[selectedPeriod];
    const resourceKey = `${selectedResource}Change` as
      | "xpChange"
      | "goldChange"
      | "manaChange";

    if (selectedGroup === "overall") {
      const value = periodData.overall[resourceKey];
      return {
        xAxisData: ["Total"],
        seriesData: [Math.abs(value)],
      };
    } else if (selectedGroup === "byUser") {
      const users = periodData.byUser
        .sort((a, b) => Math.abs(b[resourceKey]) - Math.abs(a[resourceKey]))
        .slice(0, 15); // Top 15 users
      return {
        xAxisData: users.map((u) => u.username),
        seriesData: users.map((u) => Math.abs(u[resourceKey])),
      };
    } else if (selectedGroup === "byClass") {
      const classes = periodData.byClass.sort(
        (a, b) => Math.abs(b[resourceKey]) - Math.abs(a[resourceKey]),
      );
      return {
        xAxisData: classes.map((c) => c.class),
        seriesData: classes.map((c) => Math.abs(c[resourceKey])),
      };
    } else {
      const guilds = periodData.byGuild.sort(
        (a, b) => Math.abs(b[resourceKey]) - Math.abs(a[resourceKey]),
      );
      return {
        xAxisData: guilds.map((g) => g.guildName),
        seriesData: guilds.map((g) => Math.abs(g[resourceKey])),
      };
    }
  };

  const chartData = getChartData();
  const periodLabel = timePeriodOptions.find(
    (option) => option.value === selectedPeriod,
  )?.label;
  const resourceLabel = resourceOptions.find(
    (option) => option.value === selectedResource,
  )?.label;
  const groupLabel = groupOptions.find(
    (option) => option.value === selectedGroup,
  )?.label;
  const resourceColor = resourceOptions.find(
    (option) => option.value === selectedResource,
  )?.color;

  return (
    <div className="w-full">
      <Typography variant="h6" align="center" gutterBottom>
        Resource Gains
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
          <InputLabel id="resource-select-label">Resource</InputLabel>
          <Select
            labelId="resource-select-label"
            value={selectedResource}
            label="Resource"
            onChange={handleResourceChange}
          >
            {resourceOptions.map((option) => (
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
            id: "resourceGainCategories",
            data: chartData.xAxisData,
          },
        ]}
        series={[
          {
            data: chartData.seriesData,
            label: `${resourceLabel} ${groupLabel} (${periodLabel})`,
            color: resourceColor,
          },
        ]}
        height={300}
      />
    </div>
  );
}
