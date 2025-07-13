"use server";

import { AuthorizationError, checkAdminAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ErrorMessage } from "@/lib/error";
import { logger } from "better-auth";

export const adminGetSystemMessages = async () => {
  try {
    await checkAdminAuth();

    const messages = await db.systemMessage.findMany();
    return messages;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get system messages");
      throw error;
    }

    logger.error("Error fetching system messages:", error);
    throw new Error(
      "Failed to fetch system messages. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminUpdateSystemMessage = async (
  id: number,
  title: string,
  content: string,
) => {
  try {
    await checkAdminAuth();

    const messages = await db.systemMessage.findFirst({
      where: { id },
    });

    if (!messages) {
      throw new ErrorMessage(`System message with ID ${id} not found`);
    }

    // update the message, but not the creation time
    await db.systemMessage.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    return "System message updated successfully!";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get system messages");
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error updating system message:", error);
    throw new Error(
      "Failed to update system message. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminCreateSystemMessage = async (
  title: string,
  content: string,
) => {
  try {
    await checkAdminAuth();

    await db.systemMessage.create({
      data: {
        title,
        content,
      },
    });

    return "System message created successfully!";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to create system messages",
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error creating system message:", error);
    throw new Error(
      "Failed to create system message. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminDeleteSystemMessage = async (id: number) => {
  try {
    await checkAdminAuth();

    await db.systemMessage.delete({
      where: { id },
    });

    return "System message deleted successfully!";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to delete system messages",
      );
      throw error;
    }

    if (error instanceof ErrorMessage) {
      throw error;
    }

    logger.error("Error deleting system message:", error);
    throw new Error(
      "Failed to delete system message. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminGetSystemMessageReadCounts = async () => {
  try {
    await checkAdminAuth();

    // Assuming there is a SystemMessageRead table with systemMessageId and userId
    const readCounts = await db.systemMessage.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        _count: {
          select: { readers: true }, // count the number of readers
        },
      },
    });

    return readCounts.map((message) => ({
      id: message.id,
      title: message.title,
      content: message.content,
      createdAt: message.createdAt,
      readCount: message._count.readers,
    }));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to get system message read counts",
      );
      throw error;
    }

    logger.error("Error fetching system message read counts:", error);
    throw new Error(
      "Failed to fetch system message read counts. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
