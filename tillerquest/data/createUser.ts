"use server";

const newUserSecret = process.env.NEXT_PUBLIC_NEW_USER_SECRET;

export const checkNewUserSecret = (secret: string) => {
  console.log(
    "checking secret code for new user gen" + secret + " " + newUserSecret
  );
  console.log(secret !== newUserSecret);
  return secret !== newUserSecret;
};
