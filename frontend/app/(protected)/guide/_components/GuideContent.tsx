"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Image from "next/image";
import { ArrowDownward } from "@mui/icons-material";

const accordionSx = {
  bgcolor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 2,
  "&:before": { display: "none" },
  "&.Mui-expanded": { margin: 0 },
};

const tableContainerSx = {
  bgcolor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const headerRowSx = {
  "& th": {
    fontWeight: 700,
    color: "secondary.main",
    bgcolor: "rgba(255,255,255,0.06)",
  },
};

const bodyRowSx = {
  "&:nth-of-type(odd)": { bgcolor: "rgba(255,255,255,0.025)" },
  "&:last-child td": { borderBottom: 0 },
};

// small icon shown next to each accordion's title
function SectionIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={32}
      height={32}
      className="rounded-full object-cover"
    />
  );
}

const CLASSES = [
  {
    name: "Wizard",
    icon: "/classes/Wizard1.png",
    description:
      "Masters of the arcane. Their abilities grant more mana to allies.",
  },
  {
    name: "Barbarian",
    icon: "/classes/Barbarian1.png",
    description:
      "Stronger and tougher than other classes. Their abilities protect allies and grant increased access to the arena games.",
  },
  {
    name: "Druid",
    icon: "/classes/Druid1.png",
    description: "Strongly connected to nature. Their abilities heal allies.",
  },
  {
    name: "Warlock",
    icon: "/classes/Warlock1.png",
    description:
      "Masters of crimson magic. Their abilities manipulate health and increase gold earnings.",
  },
  {
    name: "Bard",
    icon: "/classes/Bard1.png",
    description:
      "Inspire and buff allies with cunning performances. Their abilities increase experience gain.",
  },
  {
    name: "Fighter",
    icon: "/classes/Fighter1.png",
    description:
      "Built for the dungeons. Their abilities fight enemies and grant greater rewards from the spoils of battle.",
  },
];

const DEATH_SAVE_OUTCOMES = [
  {
    roll: 1,
    outcome: "Everything on this list at once",
    icon: "/abilities/Reduced-xp-gain.png",
  },
  {
    roll: 2,
    outcome:
      "Lose your phone to a \u201cphone jail\u201d for the rest of class",
    icon: "/abilities/Phone-loss.png",
  },
  {
    roll: 3,
    outcome: "Reduced experience gain for a while",
    icon: "/abilities/Reduced-xp-gain.png",
  },
  {
    roll: 4,
    outcome: "You are hit with a pop-quiz",
    icon: "/abilities/Pop-quiz.png",
  },
  {
    roll: 5,
    outcome: "Wear the hat of shame for a while",
    icon: "/abilities/Hat-of-shame.png",
  },
  {
    roll: 6,
    outcome: "Clean the lab/hub",
    icon: "/abilities/Cleaning-duty.png",
  },
  {
    roll: 7,
    outcome: "Lose 10% of your current gold",
    icon: "/abilities/Gold-loss.png",
  },
  {
    roll: 8,
    outcome: "Lose all your mana",
    icon: "/abilities/Mana-loss.png",
  },
  {
    roll: 9,
    outcome: "Stuck doing mundane tasks",
    icon: "/abilities/Mundane-tasks.png",
  },
  {
    roll: 10,
    outcome: "Reduced mana gain for a while",
    icon: "/abilities/Reduced-mana-gain.png",
  },
  {
    roll: 11,
    outcome: "Moved to the front of the class for the next theory lecture",
    icon: "/abilities/Front-of-Class.png",
  },
  {
    roll: 12,
    outcome: "Freedom \u2014 no consequences at all",
    icon: "/abilities/Reduced-xp-gain.png",
  },
];

export default function GuideContent() {
  return (
    <div className="mx-auto mt-8 pb-8 flex max-w-3xl flex-col gap-6">
      <Accordion id="classes" defaultExpanded sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/classes/Druid1.png" />
            <Typography variant="h6">Classes</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            When you create your character, you pick a class inspired by
            high-fantasy tabletop games. Every class has its own playstyle and
            leans on a different way of supporting the guild.
          </Typography>
          <TableContainer component={Paper} sx={tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow sx={headerRowSx}>
                  <TableCell>Class</TableCell>
                  <TableCell>Playstyle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CLASSES.map((c) => (
                  <TableRow key={c.name} sx={bodyRowSx}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-2">
                        <SectionIcon src={c.icon} />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>{c.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion id="guilds" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Devilish-deal.png" />
            <Typography variant="h6">Guilds</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Your guild is your classroom&apos;s party. Guilds can be created
            with players in your same class (and sometimes between classes, if
            your gamemaster allows it). You share progress with your guildmates,
            take on the term together, and can even be called on to help
            resurrect a fallen member &mdash; at a cost to yourself. If a player
            in your guild dies, you all must sacrifice hp to bring them back to
            life.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="experience" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Song-of-Inspiration.png" />
            <Typography variant="h6">Experience</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            You earn experience for learning, doing well on tests, and general
            good behaviour. Experience accumulates toward a level-up, which
            grants 2 gemstones to spend on new abilities.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="mana" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Arcane-Focus.png" />
            <Typography variant="h6">Mana</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Just for showing up to class, you gain 2 mana for the day. Some
            abilities enable you to gain even more each day! (And wizards can
            grant more to both themselves and the guild!) Mana is spent on
            abilities, so banking it up gives you more options when you need
            them. Make sure to enable location services in your browser, and
            don&apos;t forget to click the button!
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="abilities" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Fireball.png" />
            <Typography variant="h6">Abilities</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Abilities are unlocked with gemstones (earned from leveling up) and
            used by spending mana or health. They range from small conveniences,
            like postponing a hand-in or healing a guildmate &mdash; to
            guild-wide buffs.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="health" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Crimson-Bond.png" />
            <Typography variant="h6">Health &amp; Death Saves</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Bad behaviour or fighting in the dungeons cost you health. If your
            health reaches 0, a gamemaster rolls a 12-sided death save for you
            to determine your fate:
          </Typography>
          <TableContainer component={Paper} sx={tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow sx={headerRowSx}>
                  <TableCell>Roll</TableCell>
                  <TableCell>Outcome</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEATH_SAVE_OUTCOMES.map((d) => (
                  <TableRow key={d.roll} sx={bodyRowSx}>
                    <TableCell>{d.roll}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {d.icon && <SectionIcon src={d.icon} />}
                        {d.outcome}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion id="Cosmic Events" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Cosmic-Events.png" />
            <Typography variant="h6">Cosmic Events</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Some days the game masters might introduce a daily cosmic event.
            These events can be good or bad, and can affect the entire guild or
            just a single player. Some events even grant temporary abilities!
            Cosmic events are split for Vg1 and Vg2, which means that different
            cosmic events can occur in each grade. Sometimes the effects of the
            event are immediate, and sometimes they trigger at lunchtime
            (11:20). Some events that trigger at lunchtime can be avoided with
            special abilities. Unavoidable events are explicitly stated in the
            event description. Cosmic events are not guaranteed to happen every
            day, but when they do, they can be a lot of fun!
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="minigames" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Streets-of-Gold.png" />
            <Typography variant="h6">Minigames &amp; Gold</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Not everything worth knowing fits in a lesson plan. Minigames like
            typing speed and boolean logic sharpen useful real-world skills and
            pay out in gold. Playing minigames costs arenatokens.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="arenatokens" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/abilities/Did-Someone-Say-Loot.png" />
            <Typography variant="h6">Arenatokens</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Arenatokens are the currency of the arena. Spend them to purchase
            items and services. You gain arenatokens together with daily mana,
            and by some abilities.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion id="shop" sx={accordionSx}>
        <AccordionSummary expandIcon={<ArrowDownward />}>
          <div className="flex items-center gap-2">
            <SectionIcon src="/items/dice_silver.png" />
            <Typography variant="h6">Shop &amp; Customization</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="textSecondary">
            Spend gold in the shop on dice skins, titles and cosmetics to make
            your character &mdash; and your rolls &mdash; your own. Items bought
            in the shop are never lost, even if you die or the system is reset!
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
