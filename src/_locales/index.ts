import en from "@src/_locales/en.json";
import es from "@src/_locales/es.json";
import es_419 from "@src/_locales/es-419.json";

const existingLanguageCodes = ["en", "es", "es-419"];
export const languageCodeMap = {
  en: "English",
  es: "Español",
  "es-419": "Español (LA)",
};

export * from "./localeContext";
export const defaultLocale = existingLanguageCodes.includes(navigator.language)
  ? navigator.language
  : "en";
export const messages = {
  en,
  es,
  "es-419": es_419,
};
