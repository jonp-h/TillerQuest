import { relative } from "path";

const buildEslintCommand = (filenames) =>
  `npx next lint --fix --file ${filenames
    .map((f) => relative(process.cwd(), f))
    .join(" --file ")}`;

const lintStagedConfig = {
  "**/*.{js,jsx,ts,tsx}": [
    "eslint --cache --fix",
    buildEslintCommand,
    "prettier --write",
  ],
};

export default lintStagedConfig;
