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
- [Auth.js](https://authjs.dev/) for authentication.
- [Dice-Box](https://fantasticdice.games) for dice animations.
- [Winston](https://github.com/winstonjs/winston/) for server-side logging.
- [Zod](https://zod.dev/) for validation.
- [D3](https://d3js.org/) for data visualization.

## How To Use

```ps
# Clone this repository
$ git clone

# Enter the repository
$ cd /frontend/

# Install dependencies
$ npm i

# Run the app
$ npm run dev
```

#### Setup test env

- First complete the above instructions
- Setup a local PostegreSQL instance with Docker in the backend [here](/backend/db/docker/).

- Create .env inside project folder (same folder as app/)
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

NEXT_PUBLIC_NEW_USER_SECRET=...
# Random string which is required by the user to be typed when creating a new user in the user creation page. You can make the string whatever

NEXT_PUBLIC_MAGICAL_AREA_LATITUDE=...
# Latitude coordinates of where users are allowed to gain mana from.".
NEXT_PUBLIC_MAGICAL_AREA_LONGITUDE=...
# Longitude coordinates of where users are allowed to gain mana from.".
```

```ps
$ cd backend/

$ npx prisma db push

$ node db/generate.js #To mock an example database

```

- You can inspect the database with "npx prisma studio"
  - If the mocking was successful the database should have example data
- Create your own user by signing in with GitHub OAuth and creating a user
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
tillerquest/
├── .env
├── .eslintrc.json
├── .gitignore
├── .next/
│ ├── ...
├── app/
│ ├── (protected)/
│ │ ├── page/
│ │ │ ├── _page-specific-components/
│ │ │ │ └── Component.tsx
│ │ │ └── page.tsx
│ │ └── ...
├── auth.config.ts
├── auth.ts
├── components/
│ ├── navbar/
│ │ ├── Navbar.tsx
│ │ └── NavbarContent.tsx
│ └── MainContainer.tsx
├── data/
│ ├── mocking/
│ │ ├── users.json
│ │ └── generate.mjs
│ └── abilities.ts
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
