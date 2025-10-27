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

type ResourceType = "hp" | "mana" | "xp" | "gold";
type GroupType = "overall" | "byClass" | "byGuild";

interface ResourceAverageData {
  overall: {
    _avg: {
      hp: number | null;
      mana: number | null;
      xp: number | null;
      gold: number | null;
    };
  };
  byClass: Array<{
    class: string | null;
    _avg: {
      hp: number | null;
      mana: number | null;
      xp: number | null;
      gold: number | null;
    };
  }>;
  byGuild: Array<{
    guildName: string | null;
    _avg: {
      hp: number | null;
      mana: number | null;
      xp: number | null;
      gold: number | null;
    };
  }>;
}

interface ResourceAverageSelectorProps {
  data: ResourceAverageData;
}

const resourceOptions = [
  { value: "hp", label: "Health Points" },
  { value: "mana", label: "Mana" },
  { value: "xp", label: "Experience Points" },
  { value: "gold", label: "Gold" },
];

const groupOptions = [
  { value: "overall", label: "Overall Average" },
  { value: "byClass", label: "By Class" },
  { value: "byGuild", label: "By Guild" },
];

export default function ResourceAverageSelector({
  data,
}: ResourceAverageSelectorProps) {
  const [selectedResource, setSelectedResource] =
    useState<ResourceType>("mana");
  const [selectedGroup, setSelectedGroup] = useState<GroupType>("byClass");

  const handleResourceChange = (event: SelectChangeEvent) => {
    setSelectedResource(event.target.value as ResourceType);
  };

  const handleGroupChange = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value as GroupType);
  };

  const getChartData = () => {
    if (selectedGroup === "overall") {
      return {
        xAxisData: ["Overall"],
        seriesData: [data.overall._avg[selectedResource] || 0],
      };
    } else if (selectedGroup === "byClass") {
      return {
        xAxisData: data.byClass.map((stat) => stat.class ?? "Unknown"),
        seriesData: data.byClass.map(
          (stat) => stat._avg[selectedResource] || 0,
        ),
      };
    } else {
      return {
        xAxisData: data.byGuild.map((stat) => stat.guildName ?? "Unknown"),
        seriesData: data.byGuild.map(
          (stat) => stat._avg[selectedResource] || 0,
        ),
      };
    }
  };

  const chartData = getChartData();
  const resourceLabel = resourceOptions.find(
    (option) => option.value === selectedResource,
  )?.label;

  return (
    <div className="w-full">
      <Typography variant="h6" align="center" gutterBottom>
        Current Resource Averages
      </Typography>

      <div className="flex gap-4 mb-4 justify-center">
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
            id: "resourceCategories",
            data: chartData.xAxisData,
          },
        ]}
        series={[
          {
            data: chartData.seriesData,
            label: resourceLabel,
          },
        ]}
        height={300}
        width={1200}
        grid={{ horizontal: true }}
      />
    </div>
  );
}
