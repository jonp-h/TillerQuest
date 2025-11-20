import { logger } from "./logger";

const webhookUrl = process.env.WEBHOOK_URL;
// const websiteUrl = process.env.WEBSITE_URL || "http://localhost:3000";

export const sendDiscordMessage = async (
  author: string,
  title: string,
  message: string,
) => {
  if (!webhookUrl) {
    logger.error("Discord webhook URL not set");
    return;
  }

  const body = JSON.stringify({
    embeds: [
      {
        title: title,
        // title_url: websiteUrl,
        description: message,
        color: 0x6e40c9,
        author: {
          name: "TillerQuest",
          // icon_url: `${websiteUrl}/TQCircle.svg`,
        },
        timestamp: new Date().toISOString(),
        footer: {
          text: author,
          // icon_url: `${websiteUrl}/TQCircle.svg`,
        },
      },
    ],
  });

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};
