const newUserSecret = process.env.NEW_USER_SECRET;

export const checkNewUserSecret = async (secret: string) => {
  return secret !== newUserSecret;
};
