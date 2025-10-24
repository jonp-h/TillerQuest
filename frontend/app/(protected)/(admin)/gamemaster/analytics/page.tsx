import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";

import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import {
  getAbilityUsageStats,
  getResourceAverages,
  getResourceGainStatsMultiple,
  getAbilityEfficiencyStatsMultiple,
  getGameGoldStatsMultiple,
  getDungeonStatsMultiple,
  getAbilityBalanceReport,
  getClassPowerComparison,
} from "@/data/analytics/analytics";
import ResourceAverageSelector from "./_components/ResourceAverageSelector";
import AbilityUsageSelector from "./_components/AbilityUsageSelector";
import ResourceGainSelector from "./_components/ResourceGainSelector";
import ManaEfficiencySelector from "./_components/ManaEfficiencySelector";
import GameGoldSelector from "./_components/GameGoldSelector";
import DungeonSelector from "./_components/DungeonSelector";
import AbilityBalanceReport from "./_components/AbilityBalanceReport";
import ClassPowerComparison from "./_components/ClassPowerComparison";

async function Manage() {
  await redirectIfNotAdmin();

  const [
    abilityStats2Weeks,
    abilityStats1Week,
    abilityStatsToday,
    resourceAverages,
    resourceGainStats,
    abilityEfficiencyStats,
    gameGoldStats,
    dungeonStats,
    abilityBalanceReport,
    classPowerComparison,
  ] = await Promise.all([
    getAbilityUsageStats(14),
    getAbilityUsageStats(7),
    getAbilityUsageStats(1),
    getResourceAverages(),
    getResourceGainStatsMultiple(),
    getAbilityEfficiencyStatsMultiple(),
    getGameGoldStatsMultiple(),
    getDungeonStatsMultiple(),
    getAbilityBalanceReport(14),
    getClassPowerComparison(14),
  ]);

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Game Analytics Dashboard
      </Typography>
      <div className="flex flex-col gap-8 mt-2">
        <AbilityUsageSelector
          data={{
            today: abilityStatsToday,
            week: abilityStats1Week,
            twoWeeks: abilityStats2Weeks,
          }}
        />
        <ResourceGainSelector data={resourceGainStats} />

        <ManaEfficiencySelector data={abilityEfficiencyStats} />

        <GameGoldSelector data={gameGoldStats} />

        <DungeonSelector data={dungeonStats} />

        <ResourceAverageSelector data={resourceAverages} />

        <AbilityBalanceReport data={abilityBalanceReport} />

        <ClassPowerComparison data={classPowerComparison} />
      </div>
    </MainContainer>
  );
}

export default Manage;
