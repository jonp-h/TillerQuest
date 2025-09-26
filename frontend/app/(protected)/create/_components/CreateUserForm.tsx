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
import React, { useState } from "react";
import Classes from "./Classes";
import { checkNewUserSecret } from "@/data/validators/secretValidation";
import { $Enums, SchoolClass } from "@prisma/client";
import { ArrowDownward } from "@mui/icons-material";
import ClassGuilds from "./ClassGuilds";
import { validateUserCreation } from "@/data/validators/userUpdateValidation";
import { updateUser } from "@/data/user/updateUser";
import { useRouter } from "next/navigation";
import MainContainer from "@/components/MainContainer";

export default function CreateUserForm({
  data,
}: {
  data: {
    name: string | null;
    id: string;
    username: string | null;
    lastname: string | null;
    publicHighscore: boolean;
  } | null;
}) {
  const [secret, setSecret] = useState("");
  const [username, setUsername] = useState(data?.username || "");
  const [name, setName] = useState(data?.name || "");
  const [lastname, setLastname] = useState(data?.lastname || "");
  const [playerClass, setPlayerClass] = useState<string>("");
  const [guildId, setGuildId] = useState(0);
  const [schoolClass, setSchoolClass] = useState("");
  const [publicHighscore, setPublicHighscore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const router = useRouter();

  const refreshClasses = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!data?.id) {
      return;
    }

    // frontend validation
    const isCorrectSecret = await checkNewUserSecret(data.id, secret);

    if (!isCorrectSecret) {
      setErrorMessage("Invalid secret code");
      return;
    }

    const formValues = {
      username,
      name,
      lastname,
      playerClass,
      guildId,
      schoolClass,
      publicHighscore,
    };

    try {
      //FIXME: remove frontend validation, to remove server action
      // frontend validation
      const validatedData = await validateUserCreation(data.id, formValues);

      // if the data is a string, it is an error message
      if (typeof validatedData == "string") {
        setErrorMessage(validatedData);
        // if the error message includes "class", we need to ensure class selection UI is refreshed
        if (validatedData.includes("class")) {
          refreshClasses();
        }
        return;
      }

      // update the role from NEW to USER
      // add initial username, class and class image
      await updateUser(data.id, {
        secret,
        username: validatedData.username,
        name: validatedData.name,
        lastname: validatedData.lastname,
        class: validatedData.playerClass as $Enums.Class,
        image: validatedData.playerClass,
        guildId: validatedData.guildId,
        schoolClass: validatedData.schoolClass as $Enums.SchoolClass,
        publicHighscore: validatedData.publicHighscore,
      });

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
          label="Name"
          onChange={(e) => setName(e.target.value)}
          defaultValue={name}
          size="small"
          required
          helperText={
            <p>
              Enter your given name so that the
              <br />
              game masters can identify who you are
            </p>
          }
        />
        <Typography variant="body1">Enter Lastname</Typography>
        <TextField
          variant="outlined"
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
          userId={data?.id || ""}
          schoolClass={schoolClass}
          setGuildId={setGuildId}
        />
        <Typography variant="h5">Choose player class</Typography>
        <Classes
          playerClass={playerClass}
          setPlayerClass={setPlayerClass}
          userId={data?.id || ""}
          guildId={guildId}
          refreshTrigger={refreshTrigger}
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
              By creating a user you also agree the consequences of{" "}
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
          <Typography
            variant="body1"
            color="error"
            sx={{ whiteSpace: "pre-line" }}
          >
            {errorMessage}
          </Typography>
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
