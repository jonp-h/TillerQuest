import { addLog } from "lib/addLog.js";
import { db } from "lib/db.js";

export const checkNewUserSecret = async (id: string, secret: string) => {
  await addLog(
    db,
    id,
    "Checking new user secret: UserId: " + id,
    false,
    true, // debug log. excluded from global logs
  );

  const existingSecret = await db.applicationSettings.findFirst({
    where: {
      key: "NEW_USER_SECRET",
      value: secret,
    },
  });

  return !!existingSecret;
};
