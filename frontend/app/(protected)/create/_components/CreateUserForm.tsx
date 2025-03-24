"use client";
import {
  Button,
  Paper,
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
import { useSession } from "next-auth/react";
import { checkNewUserSecret } from "@/data/validators/secretValidation";
import { SchoolClass } from "@prisma/client";
import { ArrowDownward } from "@mui/icons-material";
import ClassGuilds from "./ClassGuilds";
import { validateUserCreation } from "@/data/validators/userUpdateValidation";

export default function CreateUserForm() {
  // FIXME: switch to unstable_update in auth.ts when unstable_update is released
  const { update, data } = useSession();

  const [secret, setSecret] = useState("");
  const [username, setUsername] = useState(data?.user.username);
  const [name, setName] = useState(data?.user.name);
  const [lastname, setLastname] = useState(data?.user.lastname);
  const [playerClass, setPlayerClass] = useState<string>("");
  const [guild, setGuild] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [publicHighscore, setPublicHighscore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!data?.user.id) {
      return;
    }
    const isCorrectSecret = await checkNewUserSecret(data.user.id, secret);

    if (!isCorrectSecret) {
      setErrorMessage("Secret code is incorrect");
      return;
    }

    const formValues = {
      username,
      name,
      lastname,
      playerClass,
      guild,
      schoolClass,
      publicHighscore,
    };

    try {
      const validatedData = await validateUserCreation(
        data.user.id,
        formValues,
      );

      // if the data is a string, it is an error message
      if (typeof validatedData == "string") {
        setErrorMessage(validatedData);
        return;
      }

      // update the role from NEW to USER
      // add initial username, class and class image
      // sends to auth.ts, which updates the token and the db
      await update({
        secret,
        username: validatedData.username,
        name: validatedData.name,
        lastname: validatedData.lastname,
        class: validatedData.playerClass.slice(0, -1),
        image: validatedData.playerClass,
        guild: validatedData.guild,
        schoolClass: validatedData.schoolClass,
        publicHighscore: validatedData.publicHighscore,
      });

      // call update to refresh session before redirecting to main page
      await update().then(() => {
        location.reload();
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <Paper elevation={2} className="mx-10">
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
        />
        <Typography variant="body1">Enter Name</Typography>
        <TextField
          variant="outlined"
          label="Name"
          onChange={(e) => setName(e.target.value)}
          defaultValue={name}
          size="small"
          required
          helperText="Enter your given name"
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
          userId={data?.user.id || ""}
          guild={guild}
          setGuild={setGuild}
        />
        <Typography variant="h5">Choose player class</Typography>
        <Classes playerClass={playerClass} setPlayerClass={setPlayerClass} />
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
          <Typography variant="body1" color="error">
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
    </Paper>
  );
}
