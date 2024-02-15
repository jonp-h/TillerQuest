"use client";
import React from "react";
import Image from "next/image";
import clsx from "clsx";

export default function ClanMemberGrid(props: any) {
  const memberList = props.memberList;
  return (
    <>
      {memberList.map((member: any) => {
        return (
          <div key={member.name} className="text-center">
            <Image
              src={"/classes/" + member.image + ".jpg"}
              alt={member.name}
              onClick={() => props.setSelectedUser(member.id)}
              className={clsx(
                "rounded-full shadow-inner shadow-black",
                member.id === props.selectedUser &&
                  " border-4 shadow-inner shadow-black border-purple-600 "
              )}
              width={150}
              height={150}
              draggable="false"
            />
            <h1
              className={clsx(
                "text-2xl pt-1",
                member.id === props.selectedUser && "text-purple-400 font-bold"
              )}
            >
              {/* TODO: Could add name and lastname */}
              {member.username}
            </h1>
          </div>
        );
      })}
    </>
  );
}
