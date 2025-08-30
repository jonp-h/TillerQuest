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
import { SchoolClass } from "@prisma/client";
import { Fragment, useEffect, useState } from "react";
import {
  adminUpdateGuildname,
  updateGuildmembers,
  adminUpdateGuildLeader,
  adminUpdateNextGuildLeader,
} from "@/data/guilds/updateGuilds";
import DialogButton from "@/components/DialogButton";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[];
  archived: boolean;
  users: {
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  }[];
}) {
  const [selectedUsers, setSelectedUsers] = useState<
    {
      id: string;
      name: string | null;
      lastname: string | null;
      schoolClass: SchoolClass | null;
    }[]
  >(guildMembers);
  const [newGuildName, setNewGuildName] = useState(guildName);
  const [guildArchived, setGuildArchived] = useState(archived);
  const [selectedGuildLeader, setSelectedGuildLeader] = useState<{
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  } | null>(() => {
    // Find the current guild leader from the guild members
    if (guildLeader) {
      return guildMembers.find((member) => member.id === guildLeader) || null;
    }
    return null;
  });
  const [selectedNextGuildLeader, setSelectedNextGuildLeader] = useState<{
    id: string;
    name: string | null;
    lastname: string | null;
    schoolClass: SchoolClass | null;
  } | null>(() => {
    // Find the current next guild leader from the guild members
    if (nextGuildLeader) {
      return (
        guildMembers.find((member) => member.id === nextGuildLeader) || null
      );
    }
    return null;
  });

  const router = useRouter();

  // Update the guild leader options when guild members change
  useEffect(() => {
    if (
      selectedGuildLeader &&
      !selectedUsers.some((user) => user.id === selectedGuildLeader.id)
    ) {
      // If the current leader is no longer in the guild members, clear the selection
      setSelectedGuildLeader(null);
    }
    if (
      selectedNextGuildLeader &&
      !selectedUsers.some((user) => user.id === selectedNextGuildLeader.id)
    ) {
      // If the current next leader is no longer in the guild members, clear the selection
      setSelectedNextGuildLeader(null);
    }
  }, [selectedUsers, selectedGuildLeader, selectedNextGuildLeader]);

  const handleChange = async () => {
    await toast.promise(updateGuildmembers(guildName, selectedUsers), {
      pending: `Updating guild ${guildName}...`,
      success: `Successfully updated guild members for ${guildName}`,
      error: {
        render({ data }) {
          return data instanceof Error
            ? data.message
            : "Something went wrong while updating the guild members.";
        },
      },
    });

    if (newGuildName !== guildName) {
      await toast.promise(adminUpdateGuildname(guildName, newGuildName), {
        pending: `Updating guild ${guildName}...`,
        success: `Successfully updated guild name to ${newGuildName}`,
        error: {
          render({ data }) {
            return data instanceof Error
              ? data.message
              : "Something went wrong while updating the guild name.";
          },
        },
      });
    }

    // Update guild leader if it has changed
    const currentLeaderId = selectedGuildLeader?.id || null;
    if (currentLeaderId !== guildLeader) {
      await toast.promise(
        adminUpdateGuildLeader(newGuildName || guildName, currentLeaderId),
        {
          pending: `Updating guild leader for ${newGuildName || guildName}...`,
          success: `Successfully updated guild leader`,
          error: {
            render({ data }) {
              return data instanceof Error
                ? data.message
                : "Something went wrong while updating the guild leader.";
            },
          },
        },
      );
    }

    // Update next guild leader if it has changed
    const currentNextLeaderId = selectedNextGuildLeader?.id || null;
    if (currentNextLeaderId !== nextGuildLeader) {
      await toast.promise(
        adminUpdateNextGuildLeader(
          newGuildName || guildName,
          currentNextLeaderId,
        ),
        {
          pending: `Updating next guild leader for ${newGuildName || guildName}...`,
          success: `Successfully updated next guild leader`,
          error: {
            render({ data }) {
              return data instanceof Error
                ? data.message
                : "Something went wrong while updating the next guild leader.";
            },
          },
        },
      );
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
        options={selectedUsers} // Only show current guild members
        groupBy={(option) => option.schoolClass?.split("_")[1] || "No Class"}
        getOptionLabel={(option) =>
          option.name + " " + (option.lastname ? option.lastname[0] : "") || ""
        }
        value={selectedGuildLeader}
        onChange={(event, newValue) => {
          setSelectedGuildLeader(newValue);
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
        options={selectedUsers} // Only show current guild members
        groupBy={(option) => option.schoolClass?.split("_")[1] || "No Class"}
        getOptionLabel={(option) =>
          option.name + " " + (option.lastname ? option.lastname[0] : "") || ""
        }
        value={selectedNextGuildLeader}
        onChange={(event, newValue) => {
          setSelectedNextGuildLeader(newValue);
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
          checked={guildArchived}
          onChange={() => setGuildArchived(!guildArchived)}
        />
        <Typography variant="body2">
          {guildArchived ? "Archived" : "Active"}
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
