"use client";
import DialogButton from "@/components/DialogButton";
import {
  adminResetSingleUser,
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
      const result = await adminUpdateUser(
        user.id,
        special,
        access,
        name,
        username,
        lastname,
      );

      if (result.success) {
        toast.success(result.data);
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await adminUpdateUser(user.id, special);

      if (result.success) {
        toast.success(result.data);
      } else {
        toast.error(result.error);
      }
    }
    if (role !== user.role) {
      const result = await updateRole(user.id, role);

      if (result.success) {
        toast.success(result.data);
      } else {
        toast.error(result.error);
      }
    }

    router.refresh();
  };
  const handleResetUser = async () => {
    const result = await adminResetSingleUser(user.id);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
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
          {/* Users should be reset instead of manually being set to NEW */}
          <MenuItem value={"NEW"} disabled>
            NEW
          </MenuItem>
          <MenuItem value={"USER"}>USER</MenuItem>
          <MenuItem value={"ARCHIVED"}>ARCHIVED</MenuItem>
          <MenuItem value={"ADMIN"}>ADMIN</MenuItem>
        </Select>
      </FormControl>
      <div className="flex gap-2">
        <DialogButton
          buttonText="Update"
          dialogTitle={"Update user: " + user.name + " " + user.lastname}
          dialogContent={"Are you sure you want to update this user?"}
          agreeText="Update"
          disagreeText="Cancel"
          buttonVariant="contained"
          dialogFunction={handleChange}
        />
        <DialogButton
          color="error"
          buttonText="Reset"
          dialogTitle={
            "(DANGERZONE) Reset user: " + user.name + " " + user.lastname
          }
          dialogContent={
            "(DANGERZONE) Are you sure you want to reset this user? This will force the user to re-enter their information and choose class/school class again. The user will also require a secret key and lose all their abilities/passives. Gemstones are refunded. Gold, shopitems, badges, and arenatokens are kept as is."
          }
          agreeText="(DANGER) Reset user to NEW"
          disagreeText="Cancel"
          buttonVariant="contained"
          dialogFunction={handleResetUser}
        />
        <Link
          href={`/profile/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outlined" color="experience">
            Profilepage
          </Button>
        </Link>
      </div>
    </>
  );
}

export default ManageUserForm;
