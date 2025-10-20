"use client";
import { Paper, Tab, Tabs } from "@mui/material";
import AbilityTree from "./AbilityTree";
import { RootAbilities, UserAbilities } from "./interfaces";
import { $Enums } from "@prisma/client";
import { SyntheticEvent, useEffect, useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Accessibility helper function
function a11yProps(index: number) {
  return {
    id: `ability-tab-${index}`,
    "aria-controls": `ability-tabpanel-${index}`,
  };
}

function AbilityTabPanel({ children, value, index, ...other }: TabPanelProps) {
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
  userClass,
  rootAbilities,
  userAbilities,
}: {
  userClass: $Enums.Class;
  rootAbilities: RootAbilities[] | null;
  userAbilities: UserAbilities[] | null;
}) {
  const [value, setValue] = useState(() => {
    const storedValue = sessionStorage.getItem("abilityTab");
    return storedValue !== null ? Number(storedValue) : 0;
  });

  // Save the value state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("abilityTab", String(value));
  }, [value]);

  // Handle tab change between ability types
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        centered
        value={value}
        indicatorColor="primary"
        textColor="inherit"
        onChange={handleChange}
        aria-label="Ability tabs"
      >
        {rootAbilities?.map((ability, index) => (
          <Tab
            key={ability.name}
            label={ability.category}
            sx={{
              color:
                Object.values($Enums.Class).includes(
                  ability.category as $Enums.Class,
                ) && userClass != (ability.category as $Enums.Class)
                  ? "error.main"
                  : "text.primary",
            }}
            style={{
              borderRadius: "10px",
            }}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>

      <div className="flex flex-col justify-center mx-20 ">
        {rootAbilities &&
          rootAbilities.map((ability, index) => (
            <AbilityTabPanel key={ability.name} value={value} index={index}>
              <AbilityTree
                userClass={userClass}
                rootAbilities={ability}
                userAbilities={userAbilities}
              />
            </AbilityTabPanel>
          ))}
      </div>
    </div>
  );
}
