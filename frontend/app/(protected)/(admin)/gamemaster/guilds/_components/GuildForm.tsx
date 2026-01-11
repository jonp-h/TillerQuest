"use client";
import {
  Autocomplete,
  Checkbox,
  TextField,
  CircularProgress,
  Switch,
  Typography,
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { SchoolClass } from "@tillerquest/prisma/browser";
import { Fragment, useEffect, useState } from "react";
import DialogButton from "@/components/DialogButton";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BasicUser } from "./types";
import { securePatchClient } from "@/lib/secureFetchClient";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function GuildForm({
  guildName,
  guildLeader,
  nextGuildLeader,
  guildMembers,
  archived,
  users,
}: {
  guildName: string;
  guildLeader: string | null;
  nextGuildLeader: string | null;
  guildMembers: {
    id: string;
    name: string | null;
    schoolClass: SchoolClass | null;
    lastname: string | null;
  }[];
  archived: boolean;
  users: BasicUser[];
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    guildMembers.map((member) => member.id),
  );
  const [newGuildName, setNewGuildName] = useState(guildName);
  const [guildArchived, setGuildArchived] = useState(archived);
  const [selectedGuildLeader, setSelectedGuildLeader] = useState<string | null>(
    () => {
      // Find the current guild leader from the guild members
      if (guildLeader) {
        return (
          guildMembers.find((member) => member.id === guildLeader)?.id || null
        );
      }
      return null;
    },
  );
  const [selectedNextGuildLeader, setSelectedNextGuildLeader] = useState<
    string | null
  >(() => {
    // Find the current next guild leader from the guild members
    if (nextGuildLeader) {
      return (
        guildMembers.find((member) => member.id === nextGuildLeader)?.id || null
      );
    }
    return null;
  });

  const router = useRouter();

  // Update the guild leader options when guild members change
  useEffect(() => {
    if (
      selectedGuildLeader &&
      !selectedUsers.some((user) => user === selectedGuildLeader)
    ) {
      // If the current leader is no longer in the guild members, clear the selection
      setSelectedGuildLeader(null);
    }
    if (
      selectedNextGuildLeader &&
      !selectedUsers.some((user) => user === selectedNextGuildLeader)
    ) {
      // If the current next leader is no longer in the guild members, clear the selection
      setSelectedNextGuildLeader(null);
    }
  }, [selectedUsers, selectedGuildLeader, selectedNextGuildLeader]);

  const handleChange = async () => {
    // Only send data that has actually changed
    const changes: {
      userIds?: string[];
      guildLeaderId?: string | null;
      nextGuildLeaderId?: string | null;
      archived?: boolean;
      newName?: string;
    } = {};

    // Check if guild members changed
    const originalMemberIds = guildMembers.map((member) => member.id).sort();
    const newMemberIds = [...selectedUsers].sort();
    if (JSON.stringify(originalMemberIds) !== JSON.stringify(newMemberIds)) {
      changes.userIds = selectedUsers;
    }

    // Check if guild leader changed
    if (selectedGuildLeader !== guildLeader) {
      changes.guildLeaderId = selectedGuildLeader;
    }

    // Check if next guild leader changed
    if (selectedNextGuildLeader !== nextGuildLeader) {
      changes.nextGuildLeaderId = selectedNextGuildLeader;
    }

    // Check if archived status changed
    if (guildArchived !== archived) {
      changes.archived = guildArchived;
    }

    // Check if guild name changed
    if (newGuildName !== guildName) {
      changes.newName = newGuildName;
    }

    // If no changes, don't send request
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }

    const result = await securePatchClient<string>(
      `/admin/guilds/${guildName}`,
      changes,
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    // ensure the page is reloaded to reflect the changes
    router.refresh();
  };

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
        value={selectedUsers.map((userId) => {
          return users.find((user) => user.id === userId)!;
        })}
        onChange={(event, newValue) => {
          setSelectedUsers(newValue.map((user) => user.id));
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
                  <Fragment>
                    {!users ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </Fragment>
                ),
              },
            }}
          />
        )}
      />
      <Autocomplete
        options={selectedUsers.map((userId) => {
          return users.find((user) => user.id === userId)!;
        })} // Only show current guild members
        groupBy={(option) => option.schoolClass?.split("_")[1] || "No Class"}
        getOptionLabel={(option) =>
          option.name + " " + (option.lastname ? option.lastname[0] : "") || ""
        }
        value={
          selectedGuildLeader
            ? users.find((user) => user.id === selectedGuildLeader)!
            : null
        }
        onChange={(event, newValue) => {
          setSelectedGuildLeader(newValue?.id || null);
        }}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {option.name + " " + (option.lastname ? option.lastname[0] : "")}
            </li>
          );
        }}
        style={{ width: 200 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Guild Leader"
            placeholder="Select a guild leader"
          />
        )}
      />
      <Autocomplete
        options={selectedUsers.map((userId) => {
          return users.find((user) => user.id === userId)!;
        })} // Only show current guild members
        groupBy={(option) => option.schoolClass?.split("_")[1] || "No Class"}
        getOptionLabel={(option) =>
          option.name + " " + (option.lastname ? option.lastname[0] : "") || ""
        }
        value={
          selectedNextGuildLeader
            ? users.find((user) => user.id === selectedNextGuildLeader)!
            : null
        }
        onChange={(event, newValue) => {
          setSelectedNextGuildLeader(newValue?.id || null);
        }}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {option.name + " " + (option.lastname ? option.lastname[0] : "")}
            </li>
          );
        }}
        style={{ width: 200 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Next Guild Leader"
            placeholder="Select next guild leader"
          />
        )}
      />
      <div className="min-w-20 items-center text-center">
        <Switch
          checked={!guildArchived}
          onChange={() => setGuildArchived(!guildArchived)}
        />
        <Typography variant="body2">
          {!guildArchived ? "Active" : "Archived"}
        </Typography>
      </div>
      <DialogButton
        buttonText="Update"
        dialogTitle="Update Guild"
        dialogFunction={handleChange}
        dialogContent="Any changes to the guild name, members, leader, or next leader will be saved. Added guild members will be removed from other guilds. No guilds can have the same name. The guild leader and next guild leader must be current members of the guild. Recommended number of guild members is 5."
        buttonVariant="text"
        agreeText="Update"
        disagreeText="Cancel"
      />
      {/* <Button
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
      </Button> */}
    </>
  );
}

export default GuildForm;
