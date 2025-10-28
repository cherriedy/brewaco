import slugify from "slugify";

export function getSlug(text: string): string {
  return (slugify.default || slugify)(text, {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
}
