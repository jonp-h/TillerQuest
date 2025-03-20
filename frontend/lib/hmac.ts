import crypto from "crypto";

export const createHmac = (gameId: string, score: number) => {
  const secretKey = process.env.NEXT_PUBLIC_HMAC_SECRET_KEY;
  console.log(secretKey);

  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(`${gameId}:${score}`);
  return hmac.digest("hex");
};
