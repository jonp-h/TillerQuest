import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const updateUser = async (id: string, data: any) => {
  try {
    await db.user.update({
      where: { id },
      data: data,
    });
    return true;
  } catch {
    return false;
  }
};

async function getUserClan(id: string) {
  const userWithClan = await db.user.findUnique({
    where: { id: id },
    include: { clan: true },
  });

  return userWithClan?.clan;
}

// get all the users that are in the same clan as the current user
// TODO: could add clanname to token and use that instead of fetching the clanId
export const getUsersByCurrentUserClan = async () => {
  // const clanId = await getUserClan(id);
  const clanId = 1; // TODO: remove this hardcoding
  try {
    const users = await db.user.findMany({
      where: { clanId },
    });
    return users;
  } catch {
    return null;
  }
};
