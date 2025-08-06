interface Guild {
  name: string;
  schoolClass?: string; // optional, used for guilds with specific classes
  archived?: boolean; // optional, used for guilds that are archived
}

const guilds: Guild[] = [
  {
    name: "Game Masters",
    archived: true,
  },
  {
    name: "No-name-1IM1-1",
    schoolClass: "Class_1IM1",
  },
  {
    name: "No-name-1IM1-2",
    schoolClass: "Class_1IM1",
  },
  {
    name: "No-name-1IM1-3",
    schoolClass: "Class_1IM1",
  },
  {
    name: "No-name-1IM2-1",
    schoolClass: "Class_1IM2",
  },
  {
    name: "No-name-1IM2-2",
    schoolClass: "Class_1IM2",
  },
  {
    name: "No-name-1IM2-3",
    schoolClass: "Class_1IM2",
  },
  {
    name: "No-name-1IM3-1",
    schoolClass: "Class_1IM3",
  },
  {
    name: "No-name-1IM3-2",
    schoolClass: "Class_1IM3",
  },
  {
    name: "No-name-1IM3-3",
    schoolClass: "Class_1IM3",
  },
  {
    name: "No-name-1IM4-1",
    schoolClass: "Class_1IM4",
  },
  {
    name: "No-name-1IM4-2",
    schoolClass: "Class_1IM4",
  },
  {
    name: "No-name-1IM4-3",
    schoolClass: "Class_1IM4",
  },
  {
    name: "No-name-2IT1-1",
    schoolClass: "Class_2IT1",
  },
  {
    name: "No-name-2IT1-2",
    schoolClass: "Class_2IT1",
  },
  {
    name: "No-name-2IT1-3",
    schoolClass: "Class_2IT1",
  },
  {
    name: "No-name-2IT2-1",
    schoolClass: "Class_2IT2",
  },
  {
    name: "No-name-2IT2-2",
    schoolClass: "Class_2IT2",
  },
  {
    name: "No-name-2IT2-3",
    schoolClass: "Class_2IT2",
  },
  {
    name: "No-name-2MP1-1",
    schoolClass: "Class_2MP1",
  },
  {
    name: "No-name-2MP1-2",
    schoolClass: "Class_2MP1",
  },
  {
    name: "No-name-2MP1-3",
    schoolClass: "Class_2MP1",
  },
];

export default guilds;
