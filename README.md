<h1 align="center">
  <br>
  <!-- LOGO IMAGE -->
  <br>
  TillerQuest
  <br>
</h1>

<h4 align="center">A humble remake of the popular Heimdallsquest</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Made_By-JonPH-blue" />
 
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

<!-- SCREENSHOT -->

## Key Features

<!-- FEATURES -->

### This project uses:

- [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) for type safety.
- [Material UI](https://mui.com/material-ui/) for base components.
- [Google's Material Icons](https://fonts.google.com/icons) for icons.
- [Prisma](https://www.prisma.io/) as Object-Relational Manager.
- [Auth.js](https://authjs.dev/) for authentication.

## How To Use

```bash
# Clone this repository
$ git clone

# Go into the repository
$ cd /tillerquest/

# Install dependencies
$ npm i

# Run the app
$ npm run dev
```

## Conventions

### Project structure

tillerquest/
├── .env
├── .eslintrc.json
├── .gitignore
├── .next/
│ ├── app-build-manifest.json
│ ├── build-manifest.json
│ ├── cache/
│ ├── fallback-build-manifest.json
│ ├── package.json
│ └── react-loadable-manifest.json
├── app/
│ ├── (protected)/
│ │ ├── page/
│ │ │ ├── \_page-specific-components/
│ │ │ │ └── Component.tsx
│ │ │ └── page.tsx
│ │ └── ...
├── auth.config.ts
├── auth.ts
├── components/
│ ├── navbar/
│ │ ├── Navbar.tsx
│ │ └── NavbarContent.tsx
│ ├── MainContainer.tsx
│ └── SecondaryContainer.tsx
├── data/
├── lib/
├── middleware.ts
├── next-auth.d.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── prisma/
├── public/
├── routes.ts
├── tailwind.config.ts
└── tsconfig.json

- Tailwind responsive:

  - xl: Desktop
  - lg: Laptop
  - md: Tablet
  - sm: Smartphone
  - xs: Phone (reduced screen size)

- Client side rendering:

  - Try to keep client side rendering inside "client based components" where possible
  - Eg. the needed client side code should be moved inside its own component

- Auth:
  - Client side pages use useSession()
  - Server side pages use auth()

# Design manual:

### Main color Scheme:

(made for dark mode)

- **Main color:**
  - slate-900 #0f172a
  - slate-700 #334155
- **Primary:**
  - primary: purple-900 #581c87
  - variant:
  - hover: purple-800 #6b21a8
  - text: purple-500 #a855f7
- **Text:**
  - white

<!--

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone

# Go into the repository

# Install dependencies
$ npm install

# Run the app
$ npm start
```

-->

## Credits

- Based on [Heimdallsquest](https://heimdallsquest.biz/)

This software uses the following open source packages:

- [Node.js](https://nodejs.org/)
