"use server";

const newUserSecret = process.env.NEXT_PUBLIC_NEW_USER_SECRET;

export const checkNewUserSecret = (secret: string) => {
  return secret !== newUserSecret;
};
