"use client";
import AbilityGrid from "@/components/ui/UserAbilities";
import { Tab, Tabs } from "@mui/material";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

export default function Abilities() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `tab-${index}`,
      "aria-controls": `tabpanel-${index}`,
    };
  }

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <h2 className="font-extrabold text-2xl">Abilites</h2>

        <div className="flex flex-col">
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="primary"
            aria-label="ability tabs"
          >
            <Tab label="Cleric" {...a11yProps(0)} />
            <Tab label="Druid" {...a11yProps(1)} />
            <Tab label="Mage" {...a11yProps(2)} />
            <Tab label="Rogue" {...a11yProps(3)} />
            <Tab label="Warrior" {...a11yProps(4)} />
            <Tab label="Norse" {...a11yProps(5)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            Item One
            <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
              <AbilityGrid />
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            Item Two
          </TabPanel>
          <TabPanel value={value} index={2}>
            Item Three
          </TabPanel>
          <TabPanel value={value} index={3}>
            Item Four
          </TabPanel>
          <TabPanel value={value} index={4}>
            Item Five
          </TabPanel>
          <TabPanel value={value} index={5}>
            Item Six
          </TabPanel>
        </div>
      </div>
    </main>
  );
}
