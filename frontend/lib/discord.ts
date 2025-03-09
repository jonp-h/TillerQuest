import { logger } from "./logger";

const webhookUrl = process.env.WEBHOOK_URL;

export const sendDiscordMessage = async (username: string, message: string) => {
  if (!webhookUrl) {
    logger.error("Discord webhook URL not set");
    return;
  }

  const body = JSON.stringify({
    content: message,
    username,
  });

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};
