import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes i18next with filesystem backend for English and Vietnamese locales.
 * Must be called once at application startup.
 */
export async function initI18n(): Promise<void> {
  await i18next.use(Backend).init({
    backend: {
      loadPath: path.join(__dirname, "../../locales/{{lng}}.json"),
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    lng: "en",
    preload: ["en", "vi"], // preload English and Vietnamese
    returnObjects: true,
  });
}

/**
 * Translates a key to the specified locale.
 * @param key - Translation key (e.g., "registration.success")
 * @param locale - Target locale ('en' or 'vi')
 * @param options - Additional i18next options
 * @returns Translated string
 */
export function t(
  key: string,
  locale = "en",
  options?: Record<string, unknown>,
): string {
  return i18next.t(key, { lng: locale, ...options });
}
