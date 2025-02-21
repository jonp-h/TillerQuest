"use client";
import { updateUserSpecialStatus } from "@/data/admin/adminUserInteractions";
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { UserRole } from "@prisma/client";
import { useState } from "react";

function UserSpecialStatus(user: {
  special: string[];
  id: string;
  name: string | null;
  username: string | null;
  lastname: string | null;
  role: UserRole;
}) {
  const [special, setSpecial] = useState<string[]>(user.special);
  const [role, setRole] = useState<UserRole>(user.role);

  return (
    <>
      <Typography variant="h4">
        {user.name + " " + user.username + " " + user.lastname}
      </Typography>
      <TextField
        variant="outlined"
        label="Special"
        value={special.join(" ")}
        onChange={(e) => setSpecial(e.target.value.split(" "))}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          updateUserSpecialStatus(user.id, special);
        }}
      >
        Update
      </Button>
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel>Role</InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={role}
          onChange={(value) => setRole(value.target.value as UserRole)}
          autoWidth
          label="Role"
        >
          <MenuItem value={"ADMIN"}>ADMIN</MenuItem>
          <MenuItem value={"USER"}>USER</MenuItem>
          <MenuItem value={"NEW"}>NEW</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default UserSpecialStatus;
