import { MeiliSearch } from "meilisearch";

/**
 * MeiliSearch client singleton.
 * Configured via environment variables:
 *
 * - MEILI_HOST: MeiliSearch server URL (default: http://127.0.0.1:7700)
 * - MEILI_API_KEY: MeiliSearch API key for authentication
 */
const host = process.env.MEILI_HOST ?? "http://127.0.0.1:7700";
const apiKey = process.env.MEILI_API_KEY ?? "";

export const meiliSearchClient = new MeiliSearch({ apiKey, host });
