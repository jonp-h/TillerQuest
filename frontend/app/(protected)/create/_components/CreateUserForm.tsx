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
import { checkNewUserSecret } from "@/data/createUser";
import { SchoolClass } from "@prisma/client";
import { ArrowDownward } from "@mui/icons-material";
import ClassGuilds from "./ClassGuilds";
import { z } from "zod";
import { escapeHtml, newUserSchema } from "@/lib/newUserValidation";

export default function CreateUserForm() {
  // TODO: switch to unstable_update in auth.ts?
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

    const isCorrectSecret = await checkNewUserSecret(secret);

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
      const validatedData = newUserSchema.parse(formValues);

      // Sanitize inputs
      const sanitizedData = {
        ...validatedData,
        username: escapeHtml(validatedData.username),
        name: escapeHtml(validatedData.name),
        lastname: escapeHtml(validatedData.lastname),
        playerClass: escapeHtml(validatedData.playerClass),
        guild: escapeHtml(validatedData.guild),
        schoolClass: escapeHtml(validatedData.schoolClass),
      };

      // update the role from NEW to USER
      // add initial username, name, lastname, class and class image
      // sends to auth.ts, which updates the token and the db
      await update({
        role: "USER",
        username: sanitizedData.username,
        name: sanitizedData.name,
        lastname: sanitizedData.lastname,
        class: sanitizedData.playerClass.slice(0, -1),
        image: sanitizedData.playerClass,
        guild: sanitizedData.guild,
        schoolClass: sanitizedData.schoolClass,
        publicHighscore: sanitizedData.publicHighscore,
      });

      // call update to refresh session before redirecting to main page
      await update().then(() => {
        location.reload();
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMessage(error.errors.map((e) => e.message).join(", "));
      }
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
        <Typography variant="h5">Choose school class</Typography>
        <RadioGroup row name="row-radio-buttons-group">
          {Object.values(SchoolClass).map((schoolClass) => (
            <FormControlLabel
              value={schoolClass}
              key={schoolClass}
              control={<Radio />}
              label={schoolClass}
              onClick={() => setSchoolClass(schoolClass)}
            />
          ))}
        </RadioGroup>
        <Typography variant="h5">Choose Guild</Typography>
        <ClassGuilds guild={guild} setGuild={setGuild} />
        <Typography variant="h5">Choose class</Typography>
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
