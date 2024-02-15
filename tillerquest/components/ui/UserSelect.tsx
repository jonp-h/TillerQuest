import { getUsersByCurrentUserClan } from "@/data/user";
import React from "react";
import ClanMemberGrid from "./ClanMemberGrid";

const UserSelect = async (props: any) => {
  {
    const members = await getUsersByCurrentUserClan();

    const memberList = members?.map((member: any) => ({
      ...member,
      name: member.name,
      src: member.image,
    }));

    return (
      <main className=" grid grid-cols-2 md:flex gap-7">
        <ClanMemberGrid
          selectedUserId={props.selectedUserId}
          setSelectedUserId={props.setSelectedUserId}
          memberList={memberList}
        />
      </main>
    );
  }
};

export default UserSelect;
