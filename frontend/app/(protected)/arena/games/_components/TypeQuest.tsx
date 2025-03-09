import { Button } from "@mui/material";
import React, { useEffect, useRef } from "react";

const paragraphs = [
  "the witcher 3: wild hunt is often considered the best rpg due to its rich, immersive world, deep storytelling, and complex characters. the game offers unparalleled freedom, with meaningful choices that shape the outcome of its intricate narrative. its vast open world is visually stunning, filled with detailed quests and dynamic interactions. coupled with its excellent combat system, impactful decisions, and expansions that further enhance the experience, the witcher 3 stands as a masterclass in game design, capturing the hearts of players and critics alike.",
  "lorem ipsum dolor sit amet, consectetur adipiscing elit. maecenas maximus risus sodales, pulvinar diam placerat, facilisis arcu. sed vel odio tincidunt, euismod sem nec, finibus felis. cras porttitor dolor quis mauris auctor, et lobortis nibh sagittis. aliquam varius a odio ac dignissim. etiam vulputate lectus ac ipsum fringilla, ut malesuada eros sodales. duis ornare a nulla sit amet ultricies. nullam ac felis non elit consequat rutrum sit amet et mi. sed dignissim suscipit erat sit amet commodo. vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae",
  "object-oriented programming (oop) is highly regarded because it promotes clean, organized, and reusable code through concepts like classes, inheritance, encapsulation, and polymorphism. by modeling real-world entities as objects, oop allows for easier management of complex systems. it encourages modularity, making it simpler to debug, maintain, and extend code. additionally, oop supports code reuse through inheritance, saving development time. its ability to model data and behavior together makes oop a powerful paradigm for building scalable and efficient applications, widely used in modern software development.",
  "lorem ipsum is simply dummy text of the printing and typesetting industry. lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. it has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. it was popularised in the 1960s with the release of letraset sheets containing lorem ipsum passages, and more recently with desktop publishing software like aldus pagemaker including versions of lorem ipsum.",
  "unity is considered one of the best game engines because of its user-friendly interface, cross-platform support, and powerful features. it allows developers to create both 2d and 3d games with ease, offering a wide range of tools and assets to streamline development. unity's extensive documentation and strong community support make it accessible for beginners while providing advanced capabilities for experienced developers. its ability to deploy games to multiple platforms, from mobile to console, makes unity a versatile and popular choice for game development.",
  "binary is a number system that uses only two digits, 0 and 1, to represent data. it is the foundation of all computer systems because digital devices, like computers, use electrical signals that are either on or off, corresponding to 1 or 0 in binary. these binary digits, or bits, are combined to form larger units of data, enabling computers to perform calculations, process information, and execute programs. binary's simplicity makes it essential for modern computing, as it efficiently translates complex instructions into basic electrical signals.",
  "hexadecimal is a base-16 number system that uses sixteen symbols: 0-9 for values zero to nine, and a-f for values ten to fifteen. it’s commonly used in computing as a more human-readable way to represent binary data, since one hexadecimal digit corresponds to four binary digits (bits). this makes it efficient for encoding large amounts of data in a compact format, like memory addresses or color codes in web design. hexadecimal is especially useful for programmers and developers working with low-level hardware or memory management.",
  "the internet of things (iot) is a network of interconnected devices that communicate and share data over the internet. these devices, ranging from smart appliances to wearables, are embedded with sensors, software, and connectivity, enabling them to collect and exchange information. iot technology enhances efficiency, convenience, and automation in various industries, from healthcare to transportation. by enabling devices to interact and make intelligent decisions, iot is revolutionizing the way we live and work, creating a more connected and intelligent world.",
  "machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. it uses algorithms and statistical models to analyze data, identify patterns, and make decisions, allowing machines to perform tasks and make predictions with minimal human intervention. machine learning is used in various applications, from recommendation systems to autonomous vehicles, transforming industries and driving innovation. its ability to process large datasets and adapt to changing environments makes machine learning a powerful tool for solving complex problems.",
  "react is a popular javascript library for building user interfaces, known for its declarative and component-based approach. developed by facebook, react simplifies the process of creating interactive web applications by breaking them down into reusable components. its virtual dom efficiently updates the user interface, improving performance and user experience. react's ecosystem, including tools like react router and redux, enhances development productivity and scalability. with its strong community support and extensive documentation, react has become a go-to choice for frontend development.",
  "docker is an open-source platform that automates the deployment of applications within software containers. containers are lightweight, portable, and isolated environments that package an application and its dependencies, ensuring consistency across different computing environments. docker simplifies the process of building, shipping, and running applications, enabling developers to work more efficiently and reliably. its containerization technology improves resource utilization, scalability, and security, making it a valuable tool for modern software development and deployment.",
  "agile is an iterative and incremental approach to software development that emphasizes flexibility, collaboration, and customer feedback. it promotes adaptive planning, evolutionary development, early delivery, and continuous improvement, enabling teams to respond to change and deliver high-quality products efficiently. agile methodologies, like scrum and kanban, break down projects into manageable tasks, prioritize customer value, and foster teamwork and transparency. by embracing change and customer involvement, agile practices empower teams to deliver value faster and more effectively, driving innovation and customer satisfaction.",
  "cybersecurity is the practice of protecting systems, networks, and data from digital attacks, breaches, and unauthorized access. it encompasses a range of technologies, processes, and practices designed to safeguard information and prevent cyber threats. cybersecurity measures include encryption, firewalls, antivirus software, and intrusion detection systems, among others. with the rise of cybercrime and data breaches, cybersecurity has become a critical priority for organizations and individuals, ensuring the confidentiality, integrity, and availability of digital assets.",
  "artificial intelligence (ai) is the simulation of human intelligence processes by machines, such as learning, reasoning, and problem-solving. it encompasses a broad range of technologies, from machine learning to natural language processing, enabling systems to perform tasks that typically require human intelligence. ai applications include speech recognition, image analysis, autonomous vehicles, and chatbots, transforming industries and driving innovation. as ai continues to advance, its potential to augment human capabilities and solve complex problems is reshaping the future of technology and society.",
  "the internet is a global network of interconnected computers that communicate using standard protocols. it enables the exchange of information, resources, and services across geographic boundaries, connecting billions of people worldwide. the internet supports a wide range of applications, from email and social media to e-commerce and streaming services, transforming the way we live, work, and interact. its decentralized structure, open standards, and accessibility have democratized information and empowered individuals with unprecedented access to knowledge and opportunities.",
  "https (hypertext transfer protocol secure) is an encrypted version of http used to securely transfer data between a web browser and a website. it ensures that sensitive information, like login details or payment data, is protected from being intercepted by encrypting the communication using ssl/tls protocols. the 's' in https stands for 'secure,' indicating that the connection is private and safe from tampering or eavesdropping. most modern websites use https to protect user privacy and ensure the integrity of the data being exchanged.",
  "sql (structured query language) is a standard programming language used to manage and manipulate relational databases. it allows users to create, retrieve, update, and delete data, as well as define and modify the structure of databases and tables. sql is essential for interacting with databases, enabling developers to perform complex queries, transactions, and data operations efficiently. its declarative syntax, powerful features, and broad compatibility make sql a fundamental tool for data management and analysis in a wide range of applications.",
  "tcp (transmission control protocol) is a core protocol of the internet that ensures reliable and ordered delivery of data between devices. it works by breaking data into smaller packets, sending them across the network, and reassembling them at the destination in the correct order. tcp also handles error checking and retransmission of lost or corrupted packets, ensuring that the data arrives intact. its reliability and flow control make tcp ideal for applications like web browsing, file transfers, and emails, where accuracy and completeness are critical.",
  "api (application programming interface) is a set of rules and protocols that allows different software applications to communicate with each other. it defines the methods and data formats used for requests and responses, enabling seamless integration between systems. apis are essential for building modern web applications, enabling developers to access services, data, and functionality from external sources. they simplify development, promote reusability, and enhance interoperability, making it easier to connect diverse applications and services.",
  "dns (domain name system) is a hierarchical naming system that translates domain names, like google.com, into ip addresses, which are used by computers to identify each other on the internet. dns servers store and manage domain name records, mapping human-readable names to numerical ip addresses, allowing users to access websites and services using familiar domain names. dns plays a critical role in internet infrastructure, facilitating the resolution of domain names and ensuring the proper routing of data across the network.",
  "rest (representational state transfer) is an architectural style for designing networked applications based on the principles of simplicity, scalability, and modifiability. restful systems use standard http methods, like get, post, put, and delete, to perform operations on resources, which are represented as urls. rest emphasizes stateless communication, allowing clients to interact with servers without maintaining session information. it promotes a uniform interface, resource-based interactions, and hypermedia links, enabling flexible and efficient communication between distributed systems.",
  "git is a distributed version control system that enables developers to track changes in source code, collaborate on projects, and manage codebases efficiently. it allows users to create repositories, commit changes, merge branches, and resolve conflicts, providing a complete history of code modifications. git's branching model, staging area, and decentralized architecture make it ideal for team collaboration and code management. its integration with platforms like github and gitlab enhances development workflows, enabling continuous integration and deployment.",
  "udp (user datagram protocol) is a lightweight, connectionless network protocol that allows data to be sent without establishing a formal connection. unlike tcp, udp doesn’t guarantee packet delivery, order, or error checking, making it faster but less reliable. it's ideal for applications where speed is crucial, and occasional data loss is acceptable, such as live video streaming, online gaming, and voice calls. udp’s simplicity and low overhead make it efficient for real-time communication where quick transmission is more important than perfect accuracy.",
  "ssh (secure shell) is a cryptographic network protocol that provides secure access to remote systems over an unsecured network. it encrypts data, authenticates users, and ensures the integrity of connections, protecting sensitive information from eavesdropping and tampering. ssh enables secure file transfers, remote command execution, and tunneling, allowing users to manage servers and devices securely. its key-based authentication, strong encryption, and port forwarding capabilities make ssh a fundamental tool for system administrators and developers.",
  "html (hypertext markup language) is the standard markup language used to create and structure web pages and web applications. it defines the content and layout of a webpage using a system of tags and attributes, allowing developers to display text, images, links, and multimedia elements. html is essential for building websites, providing a foundation for styling with css and interactivity with javascript. its simplicity, versatility, and compatibility with browsers make html a fundamental language for web development and design.",
  "css (cascading style sheets) is a stylesheet language used to style and format the visual presentation of web pages written in html. it defines the layout, colors, fonts, and spacing of elements on a webpage, enhancing its appearance and user experience. css separates content from design, allowing developers to create responsive, accessible, and visually appealing websites. its flexibility, modularity, and compatibility with html and javascript make css an essential tool for web designers and frontend developers.",
  "javascript is a versatile programming language used to create interactive and dynamic web content. it enables developers to build client-side applications, manipulate web elements, and respond to user actions in real time. javascript is essential for adding interactivity, animations, and functionality to websites, enhancing the user experience. its versatility, compatibility with html and css, and extensive libraries and frameworks make javascript a powerful tool for frontend development and full-stack web applications.",
  "typescript is a superset of javascript that adds static typing, interfaces, and other features to the language. it provides optional static type checking, enabling developers to catch errors early and improve code quality. typescript supports modern javascript features, like classes, modules, and arrow functions, while introducing new concepts, like interfaces and generics. its strong typing, tooling support, and compatibility with existing javascript codebases make typescript a popular choice for building scalable and maintainable web applications.",
  "node.js is a javascript runtime built on chrome's v8 javascript engine that allows developers to run javascript code outside of a web browser. it provides a server-side environment for building scalable and high-performance applications, using event-driven, non-blocking i/o to handle concurrent requests efficiently. node.js is widely used for web servers, apis, and microservices, enabling developers to create fast and lightweight applications with javascript. its npm ecosystem, modules, and libraries make node.js a versatile platform for backend development.",
];

function TypeQuest({
  gameEnabled,
  setGameEnabled,
  handleFinishGame,
  setMoneyReward,
}: {
  gameEnabled: boolean;
  setGameEnabled: (enabled: boolean) => void;
  handleFinishGame: () => void;
  setMoneyReward: (reward: number) => void;
}) {
  const maxTime = 60;
  const [time, setTime] = React.useState(maxTime);
  const [isTyping, setIsTyping] = React.useState(false);
  const [mistakes, setMistakes] = React.useState(0);
  const [WPM, setWPM] = React.useState(0);
  const [CPM, setCPM] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [characterClassName, setCharacterClassName] = React.useState<string[]>(
    [],
  );
  const [currentParagraph, setCurrentParagraph] = React.useState<string>("");

  useEffect(() => {
    inputRef.current?.focus();
    setCharacterClassName(Array(charRefs.current.length).fill(""));

    const handleFocus = () => {
      inputRef.current?.focus();
    };

    document.addEventListener("click", handleFocus);
    return () => {
      document.removeEventListener("click", handleFocus);
    };
  }, []);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isTyping && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
        const correctChars = charIndex - mistakes;
        const totalTime = maxTime - time;

        // words per minute. Mathmatical standard is 5 characters per word
        let wpm = Math.round((correctChars / 5 / totalTime) * 60);
        wpm = wpm < 0 || !wpm || wpm == Infinity ? 0 : wpm;
        setWPM(Math.floor(wpm));

        // characters per minute
        let cpm = correctChars * (60 / totalTime);
        cpm = cpm < 0 || !cpm || cpm == Infinity ? 0 : cpm;
        setCPM(Math.floor(cpm));
      }, 1000);

      // the money reward given to the player upon completion of the game
      setMoneyReward(
        Math.floor(((CPM * (charIndex - mistakes)) / (mistakes + 1)) * 0.1) + 1,
      );
    } else if (time === 0) {
      clearInterval(interval);
      setIsTyping(false);
      setGameEnabled(false);
      handleFinishGame();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, time]);

  useEffect(() => {
    // Update charRefs array after currentParagraph is updated
    charRefs.current = Array(currentParagraph.length).fill(null);
    setCharacterClassName(Array(currentParagraph.length).fill(""));
  }, [currentParagraph]);

  const startGame = () => {
    if (!gameEnabled) {
      return;
    }
    let newParagraph = currentParagraph;
    while (newParagraph === currentParagraph) {
      newParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    }
    setCurrentParagraph(newParagraph);
    setIsTyping(true);
    setTime(maxTime);
    setMistakes(0);
    setCharIndex(0);
    charRefs.current = Array(currentParagraph.length).fill(null);
    setCharacterClassName(Array(currentParagraph.length).fill(""));
    setWPM(0);
    setCPM(0);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const characters = charRefs.current;
    const currentChar = charRefs.current[charIndex];
    const typedChar = e.target.value.slice(-1);
    if (!isTyping) {
      return;
    }
    if (charIndex < characters.length && time > 0) {
      if (typedChar === currentChar?.textContent) {
        setCharIndex(charIndex + 1);
        characterClassName[charIndex] = " bg-green-700";
      } else {
        setCharIndex(charIndex + 1);
        setMistakes(mistakes + 1);
        characterClassName[charIndex] = " bg-red-700";
      }
      if (charIndex === characters.length - 1) {
        setIsTyping(false);
        setGameEnabled(false);
        handleFinishGame();
      }
    } else {
      setIsTyping(false);
      setGameEnabled(false);
      handleFinishGame();
    }
  };

  return (
    <div className=" w-1/2 m-2 p-3 rounded-xl border shadow-lg font-mono">
      <input
        type="text"
        className=" opacity-0 -z-50 absolute"
        ref={inputRef}
        onChange={handleChange}
      />
      <p className=" select-none cursor-text text-xl">
        {currentParagraph.split("").map((char, index) => (
          <span
            key={index}
            ref={(e) => {
              charRefs.current[index] = e;
            }}
            className={
              index === charIndex ? "underline " : characterClassName[index]
            }
          >
            {char}
          </span>
        ))}
      </p>
      <div className="flex justify-evenly border-t mt-4 pt-2">
        <p>
          Time left: <strong>{time}</strong>
        </p>
        <p>
          Mistakes: <strong>{mistakes}</strong>
        </p>
        <p>
          WPM: <strong>{WPM}</strong>
        </p>
        <p>
          CPM: <strong>{CPM}</strong>
        </p>
        {
          <Button
            variant="contained"
            color="primary"
            onClick={startGame}
            disabled={!gameEnabled || isTyping}
          >
            Start
          </Button>
        }
      </div>
    </div>
  );
}

export default TypeQuest;
