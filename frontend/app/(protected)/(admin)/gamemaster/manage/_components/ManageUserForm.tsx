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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

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

  const router = useRouter();

  return (
    <>
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
      <TextField
        variant="outlined"
        label="Special"
        sx={{ marginLeft: 2 }}
        value={special.join(" ")}
        onChange={(e) => setSpecial(e.target.value.split(" "))}
      />
      <FormControl sx={{ marginX: 1, minWidth: 80 }}>
        <InputLabel>Role</InputLabel>
        <Select
          id="role"
          value={role}
          onChange={(value) => {
            setRole(value.target.value as UserRole);
          }}
          sx={{ width: 120 }}
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
            toast.success("User updated");
          } else {
            adminUpdateUser(user.id, special);
            toast.success("User updated");
          }
          if (role !== user.role) {
            updateRole(user.id, role);
            toast.success("User role updated");
          }
          router.refresh();
        }}
      >
        Update
      </Button>
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
