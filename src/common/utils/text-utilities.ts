import slugify from "slugify";

export function getSlug(text: string): string {
  return (slugify.default || slugify)(text, {
    locale: "vi",
    lower: true,
    remove: undefined,
    replacement: "-",
    strict: true,
    trim: true,
  });
}
