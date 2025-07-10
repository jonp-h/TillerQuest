<h1 align="center">
  <br>
  <!-- LOGO IMAGE -->
  <img src="/frontend/public/TQlogo.png" width="250px" />
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

- [TypeScript](https://www.typescriptlang.org/) for type safety.
- [Material UI](https://mui.com/material-ui/) for base components.
- [Google's Material Icons](https://fonts.google.com/icons) for icons.
- [Prisma](https://www.prisma.io/) as Object-Relational Manager.
- [Better-Auth](https://www.better-auth.com) for authentication.
- [Dice-Box](https://fantasticdice.games) for dice animations.
- [Winston](https://github.com/winstonjs/winston/) for server-side logging.
- [Zod](https://zod.dev/) for validation.
- [D3](https://d3js.org/) for data visualization.

## How To Use

```ps
# Clone this repository
$ git clone

$ cd TillerQuest/
# Go into the Project

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

#### Setup test env

- First complete the above instructions
- Setup a local PostegreSQL instance with Docker in the backend [here](/backend/db/docker/).

- Create .env inside the frontend folder
  - Create the following variables and replace the "..."

```
AUTH_SECRET=...
# This is a random string, you can use Auth.js CLI: "npx auth secret" (https://authjs.dev/reference/core/errors#missingsecret)

AUTH_GITHUB_ID=...
# In GitHub, create an app (https://github.com/settings/apps) and write the ID here (https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

AUTH_GITHUB_SECRET=...
# Write the secret from the same GitHub app here (https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

DATABASE_URL=...
# Your connection string to the postgresql database. Should contain username and password.

WEBHOOK_URL=...
# The Discord connection url

NEXT_PUBLIC_MAGICAL_AREA_LATITUDE=...
# Latitude coordinates of where users are allowed to gain mana from.".
NEXT_PUBLIC_MAGICAL_AREA_LONGITUDE=...
# Longitude coordinates of where users are allowed to gain mana from.".
```

- Create a new .env file in backend folder
  - Create the following variables and replace the "..."

```
AUTH_SECRET=...
# This is a random string, you can use Auth.js CLI: "npx auth secret" (https://authjs.dev/reference/core/errors#missingsecret)

AUTH_GITHUB_ID=...
# In GitHub, create an app (https://github.com/settings/apps) and write the ID here (https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

AUTH_GITHUB_SECRET=...
# Write the secret from the same GitHub app here (https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

DATABASE_URL=...
# Your connection string to the postgresql database. Should contain username and password.

```

```ps
$ cd backend/

$ npx prisma db push

$ npm run generate
# To mock an example database

$ npm run start
# To start backend
```

### Open a new Terminal

```ps
$ cd frontend/

$ npm run dev
# To open dev
```

- You can inspect the database with "npx prisma studio"
  - If the mocking was successful the database should have example data
- Create your own user by signing in with GitHub OAuth and creating a user. Example creation secret can be found in the db/seed files
- Happy testing!

## Conventions

**This project uses Typescript**

- Types should be defined as interfaces, to enable inheritance
- Types specific to a component or page should be kept inside that file
- Types required in multiple components should be kept in an interfaces.ts file in the closest \_components folder
- _Any_ should rarely be used

### Project structure

- The application use the Next.js app-router.
- Components should be kept close to the page they are used in. Eg. in a "\_components" folder within that pagefolder.
- Global and reusable components should be kept in the components folder at the root of the project.
- Remember to use Pascal-case for components.

```
└── 📁TillerQuest
    └── 📁.github
        └── 📁ISSUE_TEMPLATE
            └── bug_report.md
            └── feature_request.md
            └── scrum-story.md
            └── scrum-task.md
        └── pull_request_template.md
    └── 📁.husky
        └── 📁_
        └── commit-msg
        └── pre-commit
    └── 📁backend
        └── .env
        └── .eslintcache
        └── .gitignore
        └── .lintstagedrc.js
        └── 📁db
            └── .gitignore
            └── 📁docker
                └── .env
                └── 📁backups
                └── 📁data
                └── docker-compose.yml
                └── README.md
            └── abilities.js
            └── cosmic.js
            └── enemies.js
            └── generate.js
            └── guilds.js
            └── reset.js
            └── shopItems.js
            └── typeQuestTexts.js
            └── users.js
        └── eslint.config.js
        └── nodemon.json
        └── package-lock.json
        └── package.json
        └── 📁prisma
            └── 📁migrations
            └── schema.prisma
        └── 📁src
            └── 📁data
            └── 📁lib
            └── 📁middleware
            └── 📁types
        └── tsconfig.json
    └── 📁frontend
        └── .env
        └── .gitignore
        └── .lintstagedrc.mjs
        └── .prettierignore
        └── .prettierrc
        └── 📁app
            └── 📁(protected)
                └── 📁(admin)
                    └── 📁gamemaster
                        └── 📁cosmic
                            └── 📁_components
                        └── 📁guilds
                            └── 📁_components
                        └── 📁log
                        └── 📁manage
                            └── 📁_components
                        └── 📁resurrect
                            └── 📁_components
                        └── 📁users
                            └── 📁_components
                └── 📁abilities
                    └── 📁_components
                    └── 📁[abilityName]
                        └── 📁_components
                └── 📁arena
                    └── 📁_components
                    └── 📁games
                        └── 📁_components
                └── 📁create
                    └── 📁_components
                └── 📁dungeons
                    └── 📁_components
                └── 📁mana
                    └── 📁_components
                └── 📁profile
                    └── 📁[username]
                        └── 📁_components
                        └── 📁settings
                            └── 📁_components
                └── 📁shop
                    └── 📁_components
            └── 📁api
                └── 📁auth
                    └── 📁[...nextauth]
            └── 📁signup
        └── auth.config.ts
        └── auth.ts
        └── combined.log
        └── 📁components
            └── 📁navbar
        └── 📁data
            └── 📁abilities
                └── 📁abilityUsage
                └── 📁getters
                └── 📁transaction
            └── 📁admin
            └── 📁cosmic
            └── 📁dungeons
            └── 📁games
            └── 📁guilds
            └── 📁log
            └── 📁mana
            └── 📁passives
            └── 📁shop
            └── 📁user
            └── 📁validators
        └── eslint.config.mjs
        └── 📁lib
        └── middleware.ts
        └── next.config.mjs
        └── package-lock.json
        └── package.json
        └── postcss.config.mjs
        └── 📁prisma
            └── 📁migrations
            └── schema.prisma
        └── 📁public
            └── 📁abilities
            └── 📁assets
                └── 📁ammo
                └── 📁textures
                └── 📁themes
                    └── 📁default
            └── 📁badges
            └── 📁classes
            └── 📁dungeons
            └── 📁ragnarok
        └── routes.ts
        └── tsconfig.json
        └── 📁types
    └── .gitignore
    └── commitlint.config.mjs
    └── CONTRIBUTING.md
    └── package-lock.json
    └── package.json
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
    - This is to take advatage of SSR (Server Side Rendering)

- Server Side Rendering:

  - SSR is preferred when possible
  - All page.tsx should be kept SSR

- Authentication of users:
  - Client side pages use useSession()
  - Server side pages use auth()

# Design manual:

### Main color Scheme:

TillerQuest is an application made for darkmode. Background and colors should therefore keep a black background and white text as a base in all pages and components. **Lightmode is not supported (and never will be)**.

<!--
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
  -->

## Credits

- Based on [Heimdallsquest](https://heimdallsquest.biz/)
