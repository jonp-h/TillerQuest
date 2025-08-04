interface GameSetting {
  key: string;
  value: string; // can be a stringified JSON object if needed
}

const settings: GameSetting[] = [
  {
    key: "NEW_USER_SECRET",
    value: "test", // seed value for dev testing. must be changed to a secure random string
  },
];

export default settings;
