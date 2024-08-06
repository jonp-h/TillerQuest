"use client";
import { Paper, Tab, Tabs } from "@mui/material";
import React from "react";
import AbilityTree from "./AbilityTree";
import { RootAbilities, UserAbilities } from "./interfaces";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `ability-tabpanel-${index}`,
  };
}

function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="abilityTabPanel"
      hidden={value !== index}
      id={`ability-tabpanel-${index}`}
      aria-labelledby={`ability-tab-${index}`}
      {...other}
    >
      {value === index && <Paper elevation={5}>{children}</Paper>}
    </div>
  );
}

export default function AbilityTabs({
  rootAbilities,
  userAbilities,
}: {
  rootAbilities: RootAbilities[] | null;
  userAbilities: UserAbilities[] | null;
}) {
  const [value, setValue] = React.useState(0);

  // Handle tab change between ability types
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        centered
        value={value}
        onChange={handleChange}
        aria-label="Ability tabs"
      >
        {rootAbilities?.map((ability, index) => (
          <Tab label={ability.type} {...a11yProps(index)} />
        ))}
      </Tabs>

      <div className="flex flex-col justify-center mx-20 ">
        {rootAbilities &&
          rootAbilities.map((ability, index) => (
            <CustomTabPanel value={value} index={index}>
              <AbilityTree
                rootAbilities={ability}
                userAbilities={userAbilities}
              />
            </CustomTabPanel>
          ))}
      </div>
    </div>
  );
}
