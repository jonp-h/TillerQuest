import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { User } from "@tillerquest/prisma/browser";
import { useState } from "react";
import Link from "next/link";
import { UserResponse } from "./types";

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
  { field: "gold", headerName: "Gold", cellClassName: "text-yellow-400" },
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
  {
    field: "Profilepage",
    headerName: "Profile",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Link
        href={`/profile/${params.row.username}`}
        className="text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {params.row.username}
      </Link>
    ),
  },
];

const paginationModel = { page: 0, pageSize: 30 };

export default function NewUserList({
  users,
  setSelectedUsers,
}: {
  users: UserResponse[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set([]),
    });

  const handleSelectionChange = (
    newRowSelectionModel: GridRowSelectionModel,
  ) => {
    setRowSelectionModel(newRowSelectionModel);
    let selectedUsers: UserResponse[] = [];

    // Update the selected users based on the selection model
    if (newRowSelectionModel.type === "include") {
      selectedUsers = users.filter((user) =>
        newRowSelectionModel.ids.has(user.id),
      );
    } else {
      selectedUsers = users.filter(
        (user) => !newRowSelectionModel.ids.has(user.id),
      );
    }
    setSelectedUsers(selectedUsers.map((user) => user.id));
  };

  return (
    <Paper sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[30, 45, 60, 120]}
        checkboxSelection
        classes={{ cell: " cursor-pointer" }}
        onRowSelectionModelChange={handleSelectionChange}
        rowSelectionModel={rowSelectionModel}
        sx={{ border: 0 }}
        showToolbar
      />
    </Paper>
  );
}
