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

interface AbilityUsageData {
  today: Array<{
    abilityId: number | null;
    _count: {
      id: number;
    };
    _avg: {
      manaCost: number | null;
      xpChange: number | null;
    };
    ability: {
      name: string;
    } | null;
  }>;
  week: Array<{
    abilityId: number | null;
    _count: {
      id: number;
    };
    _avg: {
      manaCost: number | null;
      xpChange: number | null;
    };
    ability: {
      name: string;
    } | null;
  }>;
  twoWeeks: Array<{
    abilityId: number | null;
    _count: {
      id: number;
    };
    _avg: {
      manaCost: number | null;
      xpChange: number | null;
    };
    ability: {
      name: string;
    } | null;
  }>;
}

interface AbilityUsageSelectorProps {
  data: AbilityUsageData;
}

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "twoWeeks", label: "Last 14 Days" },
];

export default function AbilityUsageSelector({
  data,
}: AbilityUsageSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value as TimePeriod);
  };

  const getCurrentData = () => {
    return data[selectedPeriod];
  };

  const currentData = getCurrentData();
  const periodLabel = timePeriodOptions.find(
    (option) => option.value === selectedPeriod,
  )?.label;

  return (
    <div className="w-full">
      <Typography variant="h6" align="center" gutterBottom>
        Ability Usage Statistics
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
      </div>

      <BarChart
        xAxis={[
          {
            id: "abilityCategories",
            data: currentData.map((stat) => stat.ability?.name ?? "Unknown"),
          },
        ]}
        series={[
          {
            data: currentData.map((stat) => stat._count.id),
            label: `Usage Count (${periodLabel})`,
          },
        ]}
        height={300}
        width={1200}
      />
    </div>
  );
}
