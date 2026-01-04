import { adminReasonSchema, escapeHtml } from "@/lib/validationUtils";
import { prettifyError } from "zod";
import { ServerActionResult } from "@/types/serverActionResult";

export const adminReasonValidation = async (
  reason: string,
): Promise<ServerActionResult> => {
  const validatedData = adminReasonSchema.safeParse({ reason });

  if (!validatedData.success) {
    return { success: false, error: prettifyError(validatedData.error) };
  }

  // Sanitize inputs
  const sanitizedData = {
    reason: escapeHtml(validatedData.data.reason),
  };

  return { success: true, data: sanitizedData.reason };
};
