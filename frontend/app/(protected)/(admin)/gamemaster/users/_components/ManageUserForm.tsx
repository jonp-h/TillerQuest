"use client";
import DialogButton from "@/components/DialogButton";
import {
  adminUpdateUser,
  updateRole,
} from "@/data/admin/adminUserInteractions";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Autocomplete,
} from "@mui/material";
import { UserRole, $Enums } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function ManageUserForm(user: {
  special: string[];
  access: string[];
  id: string;
  name: string | null;
  username: string | null;
  lastname: string | null;
  schoolClass?: string | null;
  role: UserRole;
  specialStatuses?: { specialReq: string | null }[];
}) {
  const [special, setSpecial] = useState<string[]>(user.special);
  const [access, setAccess] = useState<string[]>(user.access);
  const [role, setRole] = useState<UserRole>(user.role);
  const [name, setName] = useState<string | null>(user.name);
  const [username, setUsername] = useState<string | null>(user.username);
  const [lastname, setLastname] = useState<string | null>(user.lastname);

  const router = useRouter();

  // Special options from the getSpecialStatuses query (shop items with specialReq)
  const specialOptions =
    user.specialStatuses
      ?.map((status) => status.specialReq)
      .filter((req): req is string => req !== null) || [];

  // Access enum values from Prisma schema
  const accessOptions = Object.values($Enums.Access);

  const handleChange = async () => {
    // Check if any of the values have changed

    if (
      name !== user.name ||
      username !== user.username ||
      lastname !== user.lastname ||
      access.join(" ") !== user.access.join(" ")
    ) {
      await toast.promise(
        adminUpdateUser(user.id, special, access, name, username, lastname),
        {
          pending: "Updating user...",
          success: "User information updated",
          error: {
            render({ data }) {
              return data instanceof Error
                ? `${data.message}`
                : "An error occurred while updating the user.";
            },
          },
        },
      );
    } else {
      await toast.promise(adminUpdateUser(user.id, special), {
        pending: "Updating user...",
        success: "User special tags updated",
        error: {
          render({ data }) {
            return data instanceof Error
              ? `${data.message}`
              : "An error occurred while updating the user.";
          },
        },
      });
    }
    if (role !== user.role) {
      await toast.promise(updateRole(user.id, role), {
        pending: "Updating user role...",
        success: "User role updated",
        error: {
          render({ data }) {
            return data instanceof Error
              ? `${data.message}`
              : "An error occurred while updating the user role.";
          },
        },
      });
    }

    router.refresh();
  };

  return (
    <>
      <Typography variant="h6" sx={{ marginRight: 1 }}>
        {user.schoolClass?.split("_")[1]}
      </Typography>
      <TextField
        variant="standard"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Username"
        sx={{ marginX: 1 }}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Lastname"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />
      <Autocomplete
        multiple
        options={specialOptions}
        value={special}
        onChange={(event, newValue) => setSpecial(newValue)}
        freeSolo
        isOptionEqualToValue={(option, value) => option === value}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {option}
            </li>
          );
        }}
        style={{ marginLeft: 16, minWidth: 200 }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Special"
            placeholder="Select special statuses"
          />
        )}
      />
      <Autocomplete
        multiple
        options={accessOptions}
        value={access}
        onChange={(event, newValue) => setAccess(newValue)}
        isOptionEqualToValue={(option, value) => option === value}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {option}
            </li>
          );
        }}
        style={{ marginLeft: 16, minWidth: 200 }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Access"
            placeholder="Select access permissions"
          />
        )}
      />
      <FormControl sx={{ marginLeft: 4, marginRight: 8, minWidth: 80 }}>
        <InputLabel>Role</InputLabel>
        <Select
          id="role"
          value={role}
          onChange={(value) => {
            setRole(value.target.value as UserRole);
          }}
          sx={{ width: 130 }}
          label="Role"
        >
          <MenuItem value={"NEW"}>NEW</MenuItem>
          <MenuItem value={"USER"}>USER</MenuItem>
          <MenuItem value={"ARCHIVED"}>ARCHIVED</MenuItem>
          <MenuItem value={"ADMIN"}>ADMIN</MenuItem>
        </Select>
      </FormControl>
      <DialogButton
        buttonText="Update"
        dialogTitle={"Update user: " + user.name + " " + user.lastname}
        dialogContent={"Are you sure you want to update this user?"}
        agreeText="Update"
        disagreeText="Cancel"
        buttonVariant="contained"
        dialogFunction={handleChange}
      />
      <Link
        href={`/profile/${user.username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outlined" color="experience" sx={{ mx: 1 }}>
          Profilepage
        </Button>
      </Link>
    </>
  );
}

export default ManageUserForm;
