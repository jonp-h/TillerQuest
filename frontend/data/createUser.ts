"use server";

export const checkNewUserSecret = async (secret: string) => {
  return secret == process.env.NEW_USER_SECRET;
};
