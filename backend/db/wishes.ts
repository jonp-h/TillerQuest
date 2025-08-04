interface Wish {
  id: number;
  name: string;
  description: string;
  image: string; // path to the image, e.g., "/wishes/lunch.png"
}

const wishes: Wish[] = [
  {
    id: 1,
    name: "IM Lunch",
    description:
      "Lunch run by the game masters in the IM-hub. Games, fun, movies, chat. Bring food.",
    image: "/wishes/lunch.png",
  },
  {
    id: 2,
    name: "Movie Lunch",
    description:
      "We watch a movie/TV-episode together during lunch. Please let the game masters know your suggestions for movie/TV-episode. Bring your own food.",
    image: "/wishes/movie.png",
  },
  {
    id: 3,
    name: "Gaming In Class",
    description:
      "We enter the E-sport room and play games together during class. Bring your own mouse, headset, and keyboard.",
    image: "/wishes/gaming.png",
  },
  {
    id: 4,
    name: "TillerQuest Reset",
    description:
      "A reset of the player classes, guilds and abilities. This will not reset your level, gold or items bought.",
    image: "/wishes/reset.png",
  },
  {
    id: 5,
    name: "Intro to 3D Printing",
    description:
      "Gain an introduction to 3D printing and how to use the 3D printers available in the Makerspace.",
    image: "/wishes/3dprinting.png",
  },
  {
    id: 6,
    name: "Intro to 3D modeling",
    description:
      "Gain an introduction to CAD modeling and how to use 3D modeling software.",
    image: "/wishes/3dmodeling.png",
  },
  {
    id: 7,
    name: "Advanced resin printing",
    description:
      "Gain advanced skills in resin printing and learn how to use the resin printers available in the Makerspace. Requires introduction to 3D printing first.",
    image: "/wishes/resinprinting.png",
  },
];
export default wishes;
