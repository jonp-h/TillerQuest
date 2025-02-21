import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { User } from "@prisma/client";
import { useState } from "react";

const columns: GridColDef[] = [
  { field: "name", headerName: "First name", width: 160 },
  {
    field: "username",
    headerName: "Username",
    cellClassName: "text-green-300",
    width: 160,
  },
  { field: "lastname", headerName: "Last name", width: 160 },
  {
    field: "hp",
    headerName: "HP",
    cellClassName: "text-red-400",
  },
  { field: "mana", headerName: "MP", cellClassName: "text-blue-400" },
  { field: "xp", headerName: "XP", cellClassName: "text-orange-400" },
  { field: "level", headerName: "Level", cellClassName: "text-green-300" },
  { field: "class", headerName: "Class", cellClassName: "text-purple-400" },
  {
    field: "guildName",
    headerName: "Guild",
    cellClassName: "text-yellow-400",
    width: 200,
  },
  {
    field: "schoolClass",
    headerName: "School Class",
    type: "string",
    filterable: true,
    width: 150,
    valueGetter: (params: string) => params && params.split("_")[1],
  },
];

const paginationModel = { page: 0, pageSize: 15 };

export default function NewUserList({
  users,
  selectedUsers,
  setSelectedUsers,
}: {
  users: User[];
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);

  return (
    <Paper sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30, 45, 60, 120]}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          const selectedUsernames = newSelection.map(
            (id) => users.find((user) => user.id === id)?.username,
          );
          setSelectedUsers(
            users.filter((user) => selectedUsernames.includes(user.username)),
          );
          setRowSelectionModel(newSelection);
        }}
        rowSelectionModel={rowSelectionModel}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
