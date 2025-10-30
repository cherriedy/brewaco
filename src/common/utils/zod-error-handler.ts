import { t } from "#common/utils/i18n.js";
import { ZodError } from "zod";

export const handleZodError = (
  error: ZodError,
  locale: string,
): { field: string; messages: string[] }[] => {
  const errRecord: Record<string, string[]> = {};
  for (const err of error.issues) {
    const field = err.path.join(".");
    const message = err.message;
    errRecord[field] ??= [];
    errRecord[field].push(t(message, locale));
  }
  return Object.entries(errRecord).map(([field, messages]) => ({
    field,
    messages,
  }));
};
