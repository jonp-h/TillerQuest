import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import ResourceAverageSelector from "./_components/ResourceAverageSelector";
import AbilityUsageSelector from "./_components/AbilityUsageSelector";
import ResourceGainSelector from "./_components/ResourceGainSelector";
import ManaEfficiencySelector from "./_components/ManaEfficiencySelector";
import GameGoldSelector from "./_components/GameGoldSelector";
import DungeonSelector from "./_components/DungeonSelector";
import AbilityBalanceReport from "./_components/AbilityBalanceReport";
import ClassPowerComparison from "./_components/ClassPowerComparison";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";

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
    secureGet<any>("/admin/analytics/ability-usage?days=14"),
    secureGet<any>("/admin/analytics/ability-usage?days=7"),
    secureGet<any>("/admin/analytics/ability-usage?days=1"),
    secureGet<any>("/admin/analytics/resource-averages"),
    secureGet<any>("/admin/analytics/resource-gains"),
    // secureGet<any>("/admin/analytics/mana-efficiency"),
    secureGet<any>("/admin/analytics/ability-efficiency"),
    secureGet<any>("/admin/analytics/game-gold"),
    secureGet<any>("/admin/analytics/dungeon-stats"),
    secureGet<any>("/admin/analytics/ability-balance?days=14"),
    secureGet<any>("/admin/analytics/class-power?days=14"),
  ]);

  // Check for any failed requests
  const failedRequest = [
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
  ].find((result) => !result.ok);

  if (failedRequest) {
    return (
      <MainContainer>
        <ErrorAlert message={failedRequest.error} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Game Analytics Dashboard
      </Typography>
      <div className="flex flex-col gap-8 mt-2">
        <AbilityUsageSelector
          data={{
            today: abilityStatsToday.ok ? abilityStatsToday.data : [],
            week: abilityStats1Week.ok ? abilityStats1Week.data : [],
            twoWeeks: abilityStats2Weeks.ok ? abilityStats2Weeks.data : [],
          }}
        />
        <ResourceGainSelector
          data={resourceGainStats.ok ? resourceGainStats.data : []}
        />

        <ManaEfficiencySelector
          data={abilityEfficiencyStats.ok ? abilityEfficiencyStats.data : []}
        />

        <GameGoldSelector data={gameGoldStats.ok ? gameGoldStats.data : []} />

        <DungeonSelector data={dungeonStats.ok ? dungeonStats.data : []} />

        <ResourceAverageSelector
          data={resourceAverages.ok ? resourceAverages.data : []}
        />

        <AbilityBalanceReport
          data={abilityBalanceReport.ok ? abilityBalanceReport.data : []}
        />

        <ClassPowerComparison
          data={classPowerComparison.ok ? classPowerComparison.data : []}
        />
      </div>
    </MainContainer>
  );
}

export default Manage;
