"use client";
import {
  Autocomplete,
  Checkbox,
  TextField,
  CircularProgress,
  Button,
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { SchoolClass } from "@prisma/client";
import React from "react";
import {
  updateGuildmembers,
  updateGuildname,
} from "@/data/guilds/updateGuilds";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function GuildForm({
  guildName,
  guildMembers,
  users,
}: {
  guildName: string;
  guildMembers: {
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[];
  users: {
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[];
}) {
  const [selectedUsers, setSelectedUsers] = React.useState<
    {
      id: string;
      name: string | null;
      lastname: string | null;
      schoolClass: SchoolClass | null;
    }[]
  >(guildMembers);
  const [newGuildName, setNewGuildName] = React.useState(guildName);

  return (
    <>
      <TextField
        defaultValue={guildName}
        onChange={(value) => setNewGuildName(value.target.value)}
      />
      <Autocomplete
        multiple
        options={users}
        disableCloseOnSelect
        groupBy={(option) => option.schoolClass?.split("_")[1] || "No Class"}
        loading={!users}
        getOptionLabel={(option) =>
          option.name + " " + (option.lastname ? option.lastname[0] : "") || ""
        }
        value={selectedUsers}
        onChange={(event, newValue) => {
          setSelectedUsers(newValue);
        }}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.name + " " + (option.lastname ? option.lastname[0] : "")}
            </li>
          );
        }}
        style={{ width: 500 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Guildmembers"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {!users ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              },
            }}
          />
        )}
      />
      <Button
        onClick={async () => {
          await updateGuildmembers(guildName, selectedUsers);
          if (newGuildName !== guildName) {
            await updateGuildname(guildName, newGuildName);
          }
          // ensure the page is reloaded to reflect the changes
          window.location.reload();
        }}
      >
        Update
      </Button>
    </>
  );
}

export default GuildForm;
