import { i18nConfig } from "./translations";

/**
 * Language configuration interface
 */
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Available language configurations
 */
export const availableLanguages: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
  },
];

/**
 * Get language configuration by code
 * 
 * @param code - Language code
 * @returns Language configuration
 */
export const getLanguageByCode = (code: string): LanguageConfig | undefined => {
  return availableLanguages.find((lang) => lang.code === code);
};

/**
 * Check if a language code is supported
 * 
 * @param code - Language code to check
 * @returns Boolean indicating if language is supported
 */
export const isLanguageSupported = (code: string): boolean => {
  return availableLanguages.some((lang) => lang.code === code);
};

/**
 * Get default language code
 * 
 * @returns Default language code
 */
export const getDefaultLanguage = (): string => {
  return "en";
};

/**
 * Add a new language to the available languages
 * 
 * @param language - Language configuration to add
 */
export const addLanguage = (language: LanguageConfig): void => {
  if (!isLanguageSupported(language.code)) {
    availableLanguages.push(language);
  }
}; 