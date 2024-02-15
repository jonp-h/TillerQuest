"use client";
import { useState } from "react";
import ClanMemberGrid from "./ClanMemberGrid";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@mui/material";
import { handleAbilityOnSingleUser } from "@/data/ability";

const UserSelect = (props: any) => {
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleAbility = async (userId: string, value: number) => {
    console.log("useAbility", userId, value);
    handleAbilityOnSingleUser(userId, value);
    console.log("called useAbilityOnSingleUser");
  };

  {
    const memberList = props.members?.map((member: any) => ({
      ...member,
      name: member.name,
      src: member.image,
    }));

    return (
      <>
        <main className=" grid grid-cols-2 md:flex gap-7">
          {memberList.map((member: any) => {
            return (
              <div
                key={member.name}
                // select the User id and not username
                onClick={() => setSelectedUserId(member.id)}
                className={clsx(
                  "text-center text-2xl pt-1 hover:text-purple-300",
                  member.id === selectedUserId && "text-purple-400 font-bold"
                )}
              >
                <Image
                  src={"/classes/" + member.image + ".jpg"}
                  alt={member.name}
                  className={clsx(
                    "rounded-full shadow-inner shadow-black",
                    member.id === selectedUserId &&
                      " border-solid border-4 border-purple-600"
                  )}
                  width={150}
                  height={150}
                  draggable="false"
                />
                <h1>
                  {/* TODO: Could add name and lastname */}
                  {member.username}
                </h1>
              </div>
            );
          })}
        </main>
        <Button
          variant="contained"
          size="large"
          color="primary"
          // grab the local selected user and the value of the ability from the parent server component
          onClick={() => handleAbility(selectedUserId, props.value)}
        >
          Use ability
        </Button>
      </>
    );
  }
};

export default UserSelect;
