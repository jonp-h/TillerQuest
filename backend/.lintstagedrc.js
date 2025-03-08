export default {
  "**/!(dist)/**/*.{js,ts}": ["eslint --cache --fix", "prettier --write"],
};
