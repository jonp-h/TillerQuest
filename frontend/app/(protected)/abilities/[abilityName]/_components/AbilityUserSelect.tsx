"use client";
import { AbilityTarget } from "@prisma/client";
import MiniatureProfile from "@/components/MiniatureProfile";
import { GuildMember } from "./interfaces";
import { BaseUser } from "@/types/users";

interface AbilityUserSelectProps {
  user: BaseUser;
  target: AbilityTarget;
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  guildMembers: GuildMember[];
  guildMembersWithoutUser: GuildMember[];
}

function AbilityUserSelect({
  user,
  target,
  selectedUsers,
  setSelectedUsers,
  guildMembers,
  guildMembersWithoutUser,
}: AbilityUserSelectProps) {
  return (
    <>
      <div className="flex justify-center my-5 gap-10">
        {target === "All" ? (
          guildMembers?.map((member) => (
            <MiniatureProfile
              key={member.id}
              member={member}
              selected={selectedUsers.includes(member.id)}
              showBadges={false}
              profileLink={false}
            />
          ))
        ) : target === "Others" ? (
          guildMembersWithoutUser?.map((member) => (
            <MiniatureProfile
              key={member.id}
              member={member}
              selected={selectedUsers.includes(member.id)}
              showBadges={false}
              profileLink={false}
            />
          ))
        ) : target === "Self" ? (
          <MiniatureProfile
            key={user.id}
            member={user}
            selected={selectedUsers.includes(user.id)}
            profileLink={false}
            showBadges={false}
          />
        ) : (
          guildMembersWithoutUser?.map((member) => (
            <MiniatureProfile
              key={member.id}
              member={member}
              selectable
              onSelect={setSelectedUsers}
              selected={selectedUsers.includes(member.id)}
              showBadges={false}
              profileLink={false}
            />
          ))
        )}
      </div>
    </>
  );
}

export default AbilityUserSelect;
