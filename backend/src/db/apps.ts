interface Apps {
  name: string;
  shortDescription: string;
  description?: string;
  downloadUrl?: string;
  scheduled?: Date;
}

const apps: Apps[] = [
  {
    name: "Tillerio",
    shortDescription:
      "Compete in a multiplayer game against your schoolmates as worms in a digital replica of the school.",
    description:
      "Your goal is to collect as many books as possible while avoiding other schoolmates. Move with the ARROW keys or WASD keys. Move faster by holding SPACE or SHIFT. Pick up fruits to recharge your stamina. You do not need arenatokens to participate in this game, but you do need to be present when the event is scheduled to play.",
  },
];

export default apps;
