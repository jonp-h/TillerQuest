// import { relative } from "path";

// const buildEslintCommand = (filenames) =>
//   `eslint --fix ${filenames
//     .map((f) => `"${relative(process.cwd(), f)}"`)
//     .join(" ")}`;

// const lintStagedConfig = {
//   "**/*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
// };

// export default lintStagedConfig;

const lintStagedConfig = {
  "**/*.{js,jsx,ts,tsx}": ["eslint --cache --fix", "prettier --write"],
};

export default lintStagedConfig;
