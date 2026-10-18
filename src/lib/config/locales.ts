export interface LocaleConfig {
  code: string;
  short: string;
  name: string;
  label: string;
}

export const LOCALES: Record<string, LocaleConfig> = {
  en: { code: "en", short: "EN", name: "English", label: "English" },
  de: { code: "de", short: "DE", name: "German", label: "Deutsch" },
  fr: { code: "fr", short: "FR", name: "French", label: "Français" },
  it: { code: "it", short: "IT", name: "Italian", label: "Italiano" },
  es: { code: "es", short: "ES", name: "Spanish", label: "Español" },
  "es-419": { code: "es-419", short: "ES", name: "Spanish (Latin America)", label: "Español (Latinoamérica)" },
  "pt-br": { code: "pt-br", short: "PT", name: "Portuguese (Brazil)", label: "Português (Brasil)" },
  pt: { code: "pt", short: "PT", name: "Portuguese", label: "Português" },
  ru: { code: "ru", short: "RU", name: "Russian", label: "Русский" },
  pl: { code: "pl", short: "PL", name: "Polish", label: "Polski" },
  ja: { code: "ja", short: "JA", name: "Japanese", label: "日本語" },
  ko: { code: "ko", short: "KO", name: "Korean", label: "한국어" },
  "zh-hans": { code: "zh-hans", short: "ZH", name: "Chinese (Simplified)", label: "简体中文" },
  "zh-hant": { code: "zh-hant", short: "ZH", name: "Chinese (Traditional)", label: "繁體中文" },
  tr: { code: "tr", short: "TR", name: "Turkish", label: "Türkçe" },
  cs: { code: "cs", short: "CS", name: "Czech", label: "Čeština" },
  da: { code: "da", short: "DA", name: "Danish", label: "Dansk" },
  el: { code: "el", short: "EL", name: "Greek", label: "Ελληνικά" },
  fi: { code: "fi", short: "FI", name: "Finnish", label: "Suomi" },
  hi: { code: "hi", short: "HI", name: "Hindi", label: "हिन्दी" },
  hu: { code: "hu", short: "HU", name: "Hungarian", label: "Magyar" },
  ms: { code: "ms", short: "MS", name: "Malay", label: "Bahasa Melayu" },
  nl: { code: "nl", short: "NL", name: "Dutch", label: "Nederlands" },
  no: { code: "no", short: "NO", name: "Norwegian", label: "Norsk" },
  sv: { code: "sv", short: "SV", name: "Swedish", label: "Svenska" },
  vi: { code: "vi", short: "VI", name: "Vietnamese", label: "Tiếng Việt" },
};

export const SUPPORTED_LOCALES = Object.values(LOCALES);
