"use client";
import { getUsersByCurrentUserClan } from "@/data/user";
import clsx from "clsx";
import Image from "next/image";

export default async function ClanMemberSelect(props: {
  selectedUserId: string;
  setSelectedUserId: any;
}) {
  const selectedUser = props.selectedUserId;
  const setSelectedUser = props.setSelectedUserId;
  const members = await getUsersByCurrentUserClan();
  console.log(members?.map((member: any) => member.id));

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-7">
      {members != null &&
        members.map((member: any) => {
          return (
            <div key={member.name} className="text-center">
              <Image
                src={"/classes/" + member.image + ".jpg"}
                alt={member.name}
                onClick={() => setSelectedUser(member.id)}
                className={clsx(
                  "rounded-full shadow-inner shadow-black",
                  member.id === selectedUser &&
                    " border-4 shadow-inner shadow-black border-purple-600 "
                )}
                width={200}
                height={150}
                draggable="false"
              />
              <h1
                className={clsx(
                  "text-2xl pt-1",
                  member.id === selectedUser && "text-purple-400 font-bold"
                )}
              >
                {/* TODO: Could add name and lastname */}
                {member.username}
              </h1>
            </div>
          );
        })}
    </div>
  );
}
