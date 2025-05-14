"use client";
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
} from "@mui/material";
import { UserRole } from "@prisma/client";
import { useState } from "react";

function ManageUserForm(user: {
  special: string[];
  id: string;
  name: string | null;
  username: string | null;
  lastname: string | null;
  role: UserRole;
}) {
  const [special, setSpecial] = useState<string[]>(user.special);
  const [role, setRole] = useState<UserRole>(user.role);
  const [name, setName] = useState<string | null>(user.name);
  const [username, setUsername] = useState<string | null>(user.username);
  const [lastname, setLastname] = useState<string | null>(user.lastname);

  return (
    <>
      <TextField
        variant="outlined"
        label="Special"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Special"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Special"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Special"
        value={special.join(" ")}
        onChange={(e) => setSpecial(e.target.value.split(" "))}
      />
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel>Role</InputLabel>
        <Select
          id="role"
          value={role}
          onChange={(value) => {
            setRole(value.target.value as UserRole);
          }}
          autoWidth
          label="Role"
        >
          <MenuItem value={"ADMIN"}>ADMIN</MenuItem>
          <MenuItem value={"USER"}>USER</MenuItem>
          <MenuItem value={"NEW"}>NEW</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          // Check if any of the values have changed
          if (
            name !== user.name ||
            username !== user.username ||
            lastname !== user.lastname
          ) {
            adminUpdateUser(user.id, special, name, username, lastname);
          } else {
            adminUpdateUser(user.id, special);
          }
          if (role !== user.role) {
            updateRole(user.id, role);
          }
        }}
      >
        Update
      </Button>
    </>
  );
}

export default ManageUserForm;
