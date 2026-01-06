"use client";
import {
  Button,
  Typography,
  TextField,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Class, SchoolClass } from "@tillerquest/prisma/browser";
import { ArrowDownward } from "@mui/icons-material";
import ClassGuilds from "./ClassGuilds";
import { useRouter } from "next/navigation";
import MainContainer from "@/components/MainContainer";
import { ChooseGuildResponse, GuildWithMemberClasses, NewUser } from "./types";
import ErrorAlert from "@/components/ErrorAlert";
import { toast } from "react-toastify";
import { secureGetClient, securePutClient } from "@/lib/secureFetchClient";

export default function CreateUserForm({ user }: { user: NewUser }) {
  const [secret, setSecret] = useState("");
  const [username, setUsername] = useState(user.username || "");
  const [name, setName] = useState(user.name || "");
  const [lastname, setLastname] = useState(user.lastname || "");
  const [playerClass, setPlayerClass] = useState<Class>();
  const [image, setImage] = useState<string>("");
  const [guildId, setGuildId] = useState(0);
  const [schoolClass, setSchoolClass] = useState("");
  const [publicHighscore, setPublicHighscore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [guildsAndMembers, setGuildsAndMemberClasses] = useState<
    GuildWithMemberClasses[]
  >([]);
  const [maxMembers, setMaxMembers] = useState(6);

  useEffect(() => {
    if (!schoolClass) {
      return;
    }
    const fetchGuildNames = async () => {
      const result = await secureGetClient<ChooseGuildResponse>(
        `/guilds/members/classes?schoolClass=${schoolClass}`,
      );
      if (!result.ok) {
        return;
      }

      setGuildsAndMemberClasses(
        result.data.guilds.map((guild: GuildWithMemberClasses) => guild),
      );
      setMaxMembers(result.data.maxMembers);
    };

    fetchGuildNames();
  }, [setGuildId, schoolClass]);

  const router = useRouter();

  // const refreshClasses = () => {
  //   setRefreshTrigger((prev) => prev + 1);
  // };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      // update the role from NEW to USER
      // add initial username, class and class image
      const result = await securePutClient(`/users/${user.id}`, {
        secret,
        username,
        name,
        lastname,
        playerClass,
        image,
        guildId,
        schoolClass,
        publicHighscore,
      });

      if (!result.ok) {
        toast.error("Failed to create user");
        setErrorMessage(
          result.error ||
            "Failed to create user, please contact a game master.",
        );
        router.refresh();
        return;
      } else {
        toast.success("User created successfully!");
      }

      router.push("/");
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <MainContainer>
      <form
        className="flex flex-col gap-5 py-5 items-center text-center"
        onSubmit={handleSubmit}
      >
        <Typography variant="h2">Create User</Typography>
        <Typography variant="body1">Enter Secret Code</Typography>
        <TextField
          variant="filled"
          color="secondary"
          label="Secret Code"
          onChange={(e) => setSecret(e.target.value)}
          size="small"
          required
          helperText="Enter the secret code given from a game master"
          autoComplete="off"
        />
        <Typography variant="body1">Enter Username</Typography>
        <TextField
          variant="outlined"
          color="secondary"
          label="Username"
          defaultValue={username}
          onChange={(e) => setUsername(e.target.value)}
          size="small"
          required
          helperText="This will be your public username. Must be unique."
        />
        <Typography variant="body1">Enter Name</Typography>
        <TextField
          variant="outlined"
          color="secondary"
          label="Name"
          onChange={(e) => setName(e.target.value)}
          defaultValue={name}
          size="small"
          required
          helperText={
            <>
              Enter your given name
              <br />
              Unidentifiable users will be removed without warning.
            </>
          }
        />
        <Typography variant="body1">Enter Lastname</Typography>
        <TextField
          variant="outlined"
          color="secondary"
          label="Lastname"
          onChange={(e) => setLastname(e.target.value)}
          defaultValue={lastname}
          size="small"
          required
          helperText="Enter your lastname"
        />
        <Typography variant="h5">Choose class</Typography>
        <RadioGroup row name="row-radio-buttons-group">
          {Object.values(SchoolClass).map((schoolClass) => (
            <FormControlLabel
              value={schoolClass}
              key={schoolClass}
              control={<Radio />}
              label={schoolClass.split("_")[1]}
              onClick={() => setSchoolClass(schoolClass)}
            />
          ))}
        </RadioGroup>
        <Typography variant="h5">Choose Guild</Typography>
        <ClassGuilds
          schoolClass={schoolClass}
          setGuildId={setGuildId}
          guilds={guildsAndMembers}
          maxMembers={maxMembers}
          setPlayerClass={setPlayerClass}
          image={image}
          setImage={setImage}
          guildId={guildId}
        />
        <Typography variant="body1">
          Do you want to be visible on public highscore lists?
        </Typography>
        <div>
          <Switch
            checked={publicHighscore}
            onChange={() => setPublicHighscore(!publicHighscore)}
          />
          <Typography variant="body1">
            {publicHighscore ? "Yes" : "No"}
          </Typography>
        </div>
        <Accordion sx={{ width: "40%" }}>
          <AccordionSummary
            expandIcon={<ArrowDownward />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography component="span">
              By creating a user you agree to the terms and conditions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="textSecondary">
              By creating a user, you agree that your username, name, and any
              other elements you provide will not contain offensive or
              inappropriate content. <br /> <br /> The administrators reserve
              the right to remove or modify any content that violates these
              guidelines. Violations can lead to consequences within the school
              organization, and banishment from the service.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ width: "40%" }}>
          <AccordionSummary
            expandIcon={<ArrowDownward />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography component="span">
              By creating a user you also agree to the consequences of{" "}
              <span className="text-red-500">dying in the game</span>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="textSecondary">
              By creating a user, you also agree to the consequences of dying in
              the game. To name a few: <br />
              - Losing your phone for the remaining duration of class to a
              &quot;phone jail&quot;. <br />- Temporary wearing a silly hat.{" "}
              <br /> - Having a pop-quiz
            </Typography>
          </AccordionDetails>
        </Accordion>
        {errorMessage && (
          <div className="mx-auto w-1/2">
            <ErrorAlert message={errorMessage} />
          </div>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ maxWidth: 175 }}
        >
          Create user
        </Button>
      </form>
    </MainContainer>
  );
}
