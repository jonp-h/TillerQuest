import { getUsersByCurrentUserClan } from "@/data/user";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import React, { Suspense } from "react";

export default async function ClanMemberSelect(props: {
  selectedUser: string;
  setSelectedUser: any;
}) {
  const members = await getUsersByCurrentUserClan();
  const memberList = members?.map((member: any) => {
    return <MenuItem value={member.id}>{member.name}</MenuItem>;
  });
  console.log(members);
  console.log(memberList);

  // props: {
  //   selectedUser: string;
  //   setSelectedUser: any;
  //   members: any;
  // }
  // console.log(members);
  return (
    <FormControl fullWidth>
      <InputLabel id="select-user" color="info">
        Clan member
      </InputLabel>

      <Select
        labelId="select-user"
        id="select-user"
        color="info"
        className="max-w-md"
        value={props.selectedUser}
        label="Clan member"
        onChange={props.setSelectedUser}
      >
        <Suspense fallback={<MenuItem>Loading...</MenuItem>}>
          {memberList}
        </Suspense>
      </Select>
    </FormControl>
  );
}
