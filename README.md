<div align="center">
  <!-- LOGO IMAGE -->
  <img src="/frontend/public/TillerQuestLogoVertical.svg" width="350px" alt="TillerQuest"/>
</div>

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

- [TypeScript](https://www.typescriptlang.org/) for type safety.
- [Material UI](https://mui.com/material-ui/) for base components.
- [Google's Material Icons](https://fonts.google.com/icons) for icons.
- [Prisma](https://www.prisma.io/) as Object-Relational Manager.
- [Better-Auth](https://www.better-auth.com) for authentication.
- [Dice-Box](https://fantasticdice.games) for dice animations.
- [Winston](https://github.com/winstonjs/winston/) for server-side logging.
- [Zod](https://zod.dev/) for validation.
- [D3](https://d3js.org/) for data visualization.

## Setup instructions

#### Installation

```bash
# Clone this repository
$ git clone

# Go into the Project
$ cd TillerQuest/

# Install dependencies
$ npm i

# Enter the repository
$ cd frontend/

# Install dependencies
$ npm i

# Enter the repository
$ cd ../backend/

# Install dependencies
$ npm i

```

#### Setup database

- First complete the above instructions
- Setup a local PostegreSQL instance with Docker in the backend [here](/backend/src/db/docker/).
- In the docker folder:

- Create an .env with the following:

```bash
# For the Postgres Database
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_PORT=...

# Extra to use PGAdmin
PGADMIN_DEFAULT_EMAIL=...
PGADMIN_DEFAULT_PASSWORD=...
PGADMIN_PORT=...
POSTGRES_HOST=... # the default gateway for the docker postgres_container
```

- Then start a postegresql instance with docker:

```bash
$ docker-compose up -d
```

#### Seed database / Dummy data

- You can fill the database with seed-data (dummy data) by entering the following commands in the backend/ folder

```bash
# go to the backend folder
$ cd backend/

# Add the database schema to the database
$ npx prisma db push

# Seed the database with dummy data
$ npm run gen
```

#### Setup root env

- Create .env inside the root folder (folder with .github and .husky) based on the .env.example - and fill in the values

#### Setup frontend env

- Create .env inside the frontend folder based on the .env.example - and fill in the values

#### Setup backend env

- Create .env inside the backend folder based on the .env.example - and fill in the values

### Start application

- Open a terminal in the root folder

```bash
# To start both frontend and backend in development mode
$ npm run dev
```

- Open [localhost:3000](localhost:3000)

- You can inspect the database with `npx prisma studio` in a new terminal
  - If the mocking was successful the database should have example data
- Create your own user by signing in with GitHub OAuth and creating a user. Example creation secret can be found in the db/seed files
- Happy testing!

## Conventions

**This project uses Typescript**

- Types should be defined as interfaces when possible, to enable inheritance
- Types specific to a component or page should be kept inside that file
- Types required in multiple components should be kept in an interfaces.ts or types.ts file in the closest \_components folder
- _Any_ should be avoided

### Project structure

- The application use the Next.js app-router.
- Components should be kept close to the page they are used in. Eg. in a "\_components" folder within that pagefolder.
- Global and reusable components should be kept in the components folder at the root of the project.
- Remember to use Pascal-case for components.

```
└── 📁TillerQuest
    └── 📁.github
    └── 📁.husky
    └── 📁.vscode
    └── 📁backend
        └── 📁prisma
        └── 📁src
        ├── .eslintcache
        ├── .gitignore
        ├── .lintstagedrc.js
        ├── .prettierignore
        ├── .prettierrc
        ├── combined.log
        ├── error.log
        ├── eslint.config.js
        ├── exceptions.log
        ├── nodemon.json
        ├── package-lock.json
        ├── package.json
        └── tsconfig.json
    └── 📁frontend
        └── 📁app
            └── 📁(protected)
            └── 📁api
            └── 📁signup
            ├── android-chrome-192x192.png
            ├── android-chrome-512x512.png
            ├── apple-touch-icon.png
            ├── favicon-16x16.png
            ├── favicon-32x32.png
            ├── favicon.ico
            ├── globals.css
            ├── layout.tsx
            ├── loading.tsx
            ├── manifest.webmanifest
            ├── page.tsx
            └── robots.txt
        └── 📁components
        └── 📁data
        └── 📁lib
        └── 📁prisma
        └── 📁public
        └── 📁types
        ├── .env
        ├── .eslintcache
        ├── .gitignore
        ├── .lintstagedrc.mjs
        ├── .prettierignore
        ├── .prettierrc
        ├── auth.ts
        ├── combined.log
        ├── error.log
        ├── eslint.config.mjs
        ├── exceptions.log
        ├── middleware.ts
        ├── next.config.mjs
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.mjs
        ├── routes.ts
        └── tsconfig.json
    ├── .gitignore
    ├── commitlint.config.mjs
    ├── CONTRIBUTING.md
    ├── package-lock.json
    ├── package.json
    └── README.md
```

- Tailwind responsive:
  - xl: Desktop
  - lg: Laptop
  - md: Tablet
  - sm: Smartphone
  - xs: Phone (reduced screen size)

- Client Side Rendering:
  - Try to keep client side rendering inside "client based components" where possible
    - Eg. the needed client side code should be moved inside its own component
    - This is to take advantage of SSR (Server Side Rendering)

- Server Side Rendering:
  - SSR is preferred when possible
  - All pages (page.tsx) should be kept SSR

- Authentication of users:
  - Client side pages use useSession()
  - Server side pages use getSession()

# Color Scheme:

TillerQuest is an application made for darkmode. Background and colors should therefore keep a black background and white text as a base in all pages and components. **Lightmode is not supported (and probably never will be)**.

\*_NOTE: Contrast ratio pairings have sufficient contrast for use with normal text, large text and graphics._
| Color | Hex | Contrast color | Contrast ratio | Accessibility |
| ----------------- | -------------------------------------------------------------- | ----------- | ----------- | ------------- |
| Primary | ![#6E40C9](https://placehold.co/15x15/6E40C9/6E40C9) #6E40C9 | #e2e2e2 |5:1 | WCAG AA |
| Secondary | ![#C06EFF](https://placehold.co/15x15/C06EFF/C06EFF) #C06EFF | #0d1117 | 6.23:1 | WCAG AA |
| Background | ![#0d1117](https://placehold.co/15x15/0d1117/0d1117) #0d1117 | #e2e2e2 | 14.61:1 | WCAG AAA |
| Error | ![#FF3B43](https://placehold.co/15x15/FF3B43/FF3B43) #FF3B43 | #0d1117 | 5.37:1 | WCAG AA |
| Success | ![#6EC348](https://placehold.co/15x15/6EC348/6EC348) #6EC348 | #0d1117 | 8.62:1 | WCAG AAA |
| Info | ![#3DBCEA](https://placehold.co/15x15/3DBCEA/3DBCEA) #3DBCEA | #0d1117 | 8.63:1 | WCAG AAA |
| Warning | ![#FFA726](https://placehold.co/15x15/FFA726/FFA726) #FFA726 | #0d1117 | 9.74:1 | WCAG AAA |

## Credits

- Based on [Heimdallsquest](https://heimdallsquest.biz/)
