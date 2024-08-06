"use client";
import { Paper, Tab, Tabs } from "@mui/material";
import { $Enums } from "@prisma/client";
import React from "react";
import AbilityTree from "./AbilityTree";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type RootAbilities =
  | {
      name: string;
      type: $Enums.AbilityType;
      children: {
        name: string;
        children: {
          name: string;
          children: {
            name: string;
            children: {
              name: string;
            }[];
          }[];
        }[];
      }[];
    }[]
  | null;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

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
  rootAbilities: RootAbilities;
  userAbilities:
    | {
        abilityName: string;
      }[]
    | null;
}) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (rootAbilities)
    return (
      <div>
        <Tabs
          centered
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {rootAbilities.map((ability, index) => (
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
