// max word length is 16 characters, min length is 3 characters
const wordQuestWords = [
  { id: 1, genre: "Misc", word: "WITCHER" },
  { id: 2, genre: "Misc", word: "LOREMIPSUM" },
  { id: 3, genre: "Programming", word: "OOP" },
  { id: 4, genre: "Misc", word: "DUMMYTEXT" },
  { id: 5, genre: "Programming", word: "UNITY" },
  { id: 6, genre: "IT", word: "BINARY" },
  { id: 7, genre: "IT", word: "HEXADECIMAL" },
  { id: 8, genre: "IT", word: "IOT" },
  { id: 9, genre: "IT", word: "MACHINELEARNING" },
  { id: 10, genre: "Programming", word: "REACT" },
  { id: 11, genre: "IT", word: "DOCKER" },
  { id: 12, genre: "Programming", word: "AGILE" },
  { id: 13, genre: "IT", word: "CYBERSECURITY" },
  { id: 14, genre: "IT", word: "ROBOT" },
  { id: 15, genre: "IT", word: "INTERNET" },
  { id: 16, genre: "IT", word: "HTTPS" },
  { id: 17, genre: "IT", word: "SQL" },
  { id: 18, genre: "IT", word: "TCP" },
  { id: 19, genre: "IT", word: "API" },
  { id: 20, genre: "IT", word: "DNS" },
  { id: 21, genre: "IT", word: "RESTAPI" },
  { id: 22, genre: "Programming", word: "GIT" },
  { id: 23, genre: "IT", word: "UDP" },
  { id: 24, genre: "IT", word: "SSH" },
  { id: 25, genre: "Programming", word: "HTML" },
  { id: 26, genre: "Programming", word: "CSS" },
  { id: 27, genre: "Programming", word: "JAVASCRIPT" },
  { id: 28, genre: "Programming", word: "TYPESCRIPT" },
  { id: 29, genre: "Programming", word: "NODEJS" },
  { id: 30, genre: "Programming", word: "PYTHON" },
  { id: 31, genre: "Programming", word: "JAVA" },
  { id: 32, genre: "Programming", word: "CPLUSPLUS" },
  { id: 33, genre: "IT", word: "DHCP" },
  { id: 34, genre: "IT", word: "NETWORKPACKET" },
  { id: 35, genre: "IT", word: "FIREWALL" },
  { id: 36, genre: "MP", word: "PIXEL" },
  { id: 37, genre: "MP", word: "VECTORGRAPHICS" },
  { id: 38, genre: "Misc", word: "THREEDPRINTING" },
  { id: 39, genre: "IT", word: "AUGMENTEDREALITY" }, // 16 chars - long
  { id: 40, genre: "IT", word: "VIRTUALREALITY" },
  { id: 41, genre: "Programming", word: "ASSEMBLY" },
  { id: 42, genre: "Programming", word: "BYTECODE" },
  { id: 43, genre: "Programming", word: "KERNEL" },
  { id: 44, genre: "IT", word: "CMD" },
  { id: 45, genre: "Misc", word: "TILLERVGS" },
  { id: 46, genre: "Misc", word: "ITM" },
  { id: 47, genre: "IT", word: "VONNEUMANN" },
  { id: 48, genre: "IT", word: "MOORESLAW" },
  { id: 49, genre: "MP", word: "BLENDER" },
  { id: 50, genre: "MP", word: "ADOBE" },
  { id: 51, genre: "MP", word: "PHOTOSHOP" },
  { id: 52, genre: "MP", word: "ILLUSTRATOR" },
  { id: 53, genre: "MP", word: "PREMIEREPRO" },
  { id: 54, genre: "MP", word: "AFTEREFFECTS" },
  { id: 55, genre: "MP", word: "FIGMA" },
  { id: 56, genre: "MP", word: "SECUREDIGITAL" },
  { id: 57, genre: "Misc", word: "TILLER" },
  { id: 58, genre: "Misc", word: "WORDQUEST" },
  { id: 59, genre: "IT", word: "TECHNOLOGY" },
  { id: 60, genre: "Programming", word: "DEVELOPMENT" },
  { id: 61, genre: "Programming", word: "PROGRAMMING" },
  { id: 62, genre: "Programming", word: "SOFTWARE" },
  { id: 63, genre: "IT", word: "HARDWARE" },
  { id: 64, genre: "Programming", word: "DEBUGGING" },
  { id: 65, genre: "Programming", word: "TESTING" },
  { id: 66, genre: "Programming", word: "DEPLOYMENT" },
  { id: 67, genre: "Programming", word: "VERSIONCONTROL" },
  { id: 68, genre: "Programming", word: "COLLABORATION" },
  { id: 69, genre: "Programming", word: "AGILEMETHODOLOGY" }, // 16 chars - long
  { id: 70, genre: "Programming", word: "SCRUM" },
  { id: 71, genre: "Programming", word: "KANBAN" },
  { id: 72, genre: "Programming", word: "SPRINT" },
  { id: 73, genre: "Programming", word: "BACKLOG" },
  { id: 74, genre: "Programming", word: "USERSTORY" },
  { id: 75, genre: "Programming", word: "EPIC" },
  { id: 76, genre: "Programming", word: "SPRINTPLANNING" },
  { id: 77, genre: "Programming", word: "RETROSPECTIVE" },
  { id: 78, genre: "Programming", word: "STANDUPMEETING" },
  { id: 79, genre: "Programming", word: "KANBANBOARD" },
  { id: 80, genre: "Programming", word: "SCRUMBOARD" },
  { id: 81, genre: "Programming", word: "PRODUCTOWNER" },
  { id: 82, genre: "Programming", word: "SCRUMMASTER" },
  { id: 83, genre: "IT", word: "CONTAINERIZATION" }, // 16 chars - long
  { id: 84, genre: "IT", word: "DOCKERCOMPOSE" },
  { id: 85, genre: "MP", word: "GRAPHICDESIGN" },
  { id: 86, genre: "MP", word: "USERINTERFACE" },
  { id: 87, genre: "MP", word: "USEREXPERIENCE" },
  { id: 88, genre: "MP", word: "WEBDESIGN" },
  { id: 89, genre: "MP", word: "RESPONSIVEDESIGN" }, // 16 chars - long
  { id: 90, genre: "MP", word: "COMPOSITING" },
  { id: 91, genre: "MP", word: "ANIMATION" },
  { id: 92, genre: "MP", word: "COMPOSITION" },
  { id: 93, genre: "MP", word: "COLORCORRECTION" },
  { id: 94, genre: "MP", word: "VISUALEFFECTS" },
  { id: 95, genre: "MP", word: "MOTIONGRAPHICS" },
  { id: 96, genre: "MP", word: "VIDEOEDITING" },
  { id: 97, genre: "MP", word: "POSTPRODUCTION" },
  { id: 98, genre: "MP", word: "PREPRODUCTION" },
  { id: 99, genre: "MP", word: "PRODUCTION" },
  { id: 100, genre: "MP", word: "SCRIPTING" },
  { id: 101, genre: "MP", word: "STORYBOARDING" },
  { id: 102, genre: "MP", word: "CHARACTERDESIGN" },
  { id: 103, genre: "MP", word: "EDITING" },
  { id: 104, genre: "MP", word: "CONCEPTART" },
  { id: 105, genre: "MP", word: "ILLUSTRATION" },
  { id: 106, genre: "MP", word: "TYPOGRAPHY" },
  { id: 107, genre: "MP", word: "BRANDING" },
  { id: 108, genre: "MP", word: "LOGODESIGN" },
  { id: 109, genre: "MP", word: "PACKAGEDESIGN" },
  { id: 110, genre: "MP", word: "ADVERTISING" },
  { id: 111, genre: "MP", word: "MARKETING" },
  { id: 112, genre: "MP", word: "DIRECTOR" },
  { id: 113, genre: "MP", word: "CONTENTCREATION" },
  { id: 114, genre: "MP", word: "DIGITALMARKETING" }, // 16 chars - long
  { id: 115, genre: "MP", word: "SEO" },
  { id: 116, genre: "IT", word: "CLOUDCOMPUTING" },
  { id: 117, genre: "IT", word: "CLOUDSERVICES" },
  { id: 118, genre: "IT", word: "PACKETSWITCHING" },
  { id: 119, genre: "IT", word: "SWITCHING" },
  { id: 120, genre: "IT", word: "ROUTING" },
  { id: 121, genre: "IT", word: "NETWORKING" },
  { id: 122, genre: "IT", word: "INTERNETPROTOCOL" }, // 16 chars - long
  { id: 123, genre: "IT", word: "NETWORKSECURITY" },
  { id: 124, genre: "IT", word: "ENCRYPTION" },
  { id: 125, genre: "Programming", word: "AUTHENTICATION" },
  { id: 126, genre: "Programming", word: "ACCESSCONTROL" },
  { id: 127, genre: "IT", word: "VPN" },
  { id: 128, genre: "IT", word: "PROXYSERVER" },
  { id: 129, genre: "IT", word: "ARDUINO" },
  { id: 130, genre: "IT", word: "RASPBERRYPI" },
  { id: 131, genre: "IT", word: "LINUX" },
  { id: 132, genre: "IT", word: "WINDOWS" },
  { id: 133, genre: "IT", word: "MACOS" },
  { id: 134, genre: "IT", word: "ANDROID" },
  { id: 135, genre: "IT", word: "IOS" },
];

export default wordQuestWords;
