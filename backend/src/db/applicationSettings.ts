interface ApplicationSettings {
  key: string;
  value: string; // can be a stringified JSON object if needed
  description: string;
}

const settings: ApplicationSettings[] = [
  {
    key: "NEW_USER_SECRET",
    value: "test", // seed value for dev testing. must be changed to a secure random string
    description: "Secret key for new users",
  },
  {
    key: "SCHOOL_CLASS_RESTRICTION",
    value: "SAME_CLASS", // Options: SAME_CLASS, CLASS_GROUP, ANY
    description:
      "Restriction on school class selection. Options: SAME_CLASS, CLASS_GROUP, ANY",
  },
  {
    key: "SCHOOL_CLASS_GROUPS",
    value: "1IM1,1IM2;1IM3,1IM4;2IT1,2IT2;2MP1", // Comma separate classes in the same group, semicolon separate different groups
    description:
      "Groups of school classes. Format: '1IM1,1IM2;1IM3,1IM4;2IT1,2IT2;2MP1'. Comma separate classes in the same group, semicolon separate different groups",
  },
  {
    key: "MAX_GUILD_MEMBERS",
    value: "6", // default maximum number of members per guild
    description: "Maximum number of members allowed in a guild. Default: 6",
  },
];

export default settings;
