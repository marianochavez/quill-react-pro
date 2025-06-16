// Customizing code highlight languages and CSS - Static imports for common languages
import highlight from "highlight.js/lib/core";
import "highlight.js/styles/xcode.css";

// Import commonly used languages directly for immediate availability
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";

// Define available languages with their import functions for dynamic loading (fallback)
const AVAILABLE_LANGUAGES: Record<string, () => Promise<{ default: any }>> = {
  javascript: () => import("highlight.js/lib/languages/javascript"),
  java: () => import("highlight.js/lib/languages/java"),
  cpp: () => import("highlight.js/lib/languages/cpp"),
  csharp: () => import("highlight.js/lib/languages/csharp"),
  php: () => import("highlight.js/lib/languages/php"),
  python: () => import("highlight.js/lib/languages/python"),
  sql: () => import("highlight.js/lib/languages/sql"),
  bash: () => import("highlight.js/lib/languages/bash"),
  shell: () => import("highlight.js/lib/languages/vim"),
  css: () => import("highlight.js/lib/languages/css"),
  go: () => import("highlight.js/lib/languages/go"),
  objectivec: () => import("highlight.js/lib/languages/objectivec"),
  ruby: () => import("highlight.js/lib/languages/ruby"),
  xml: () => import("highlight.js/lib/languages/xml"),
  scala: () => import("highlight.js/lib/languages/scala"),
  r: () => import("highlight.js/lib/languages/r"),
  matlab: () => import("highlight.js/lib/languages/matlab"),
  swift: () => import("highlight.js/lib/languages/swift"),
  dart: () => import("highlight.js/lib/languages/dart"),
};

// Cache for loaded languages
const loadedLanguages = new Set<string>();

// Register common languages immediately
const staticLanguages = {
  javascript,
  css,
  json,
  bash,
  python,
  java,
  cpp,
  sql,
  xml
};

Object.entries(staticLanguages).forEach(([name, definition]) => {
  highlight.registerLanguage(name, definition);
  loadedLanguages.add(name);
});

// Async function to load a language (for additional languages not included statically)
const loadLanguage = async (languageName: string): Promise<boolean> => {
  if (loadedLanguages.has(languageName)) {
    return true;
  }
  
  if (!AVAILABLE_LANGUAGES[languageName]) {
    console.warn(`Language ${languageName} is not available for dynamic loading`);
    return false;
  }

  try {
    const languageModule = await AVAILABLE_LANGUAGES[languageName]();
    highlight.registerLanguage(languageName, languageModule.default);
    loadedLanguages.add(languageName);
    
    // Update the hljs configuration to include the new language
    highlight.configure({
      languages: Array.from(loadedLanguages),
      useBR: false,
    });
    
    console.log(`Successfully loaded language: ${languageName}`);
    return true;
  } catch (error) {
    console.warn(`Failed to load language: ${languageName}`, error);
    return false;
  }
};

// Load multiple languages
const loadLanguages = async (languages: string[]): Promise<boolean[]> => {
  return await Promise.all(languages.map(loadLanguage));
};

// Get list of currently loaded languages
const getLoadedLanguages = (): string[] => {
  return Array.from(loadedLanguages);
};

// Check if a language is loaded
const isLanguageLoaded = (languageName: string): boolean => {
  return loadedLanguages.has(languageName);
};

// Synchronous initialization that returns the configured highlight instance
const highlightInit = (customLanguages?: string[]): typeof highlight => {
  highlight.configure({
    languages: Array.from(loadedLanguages),
    useBR: false,
  });

  // Declare hljs on window object if it's expected to be globally accessible
  (window as any).hljs = highlight;
  
  // Add dynamic language loader to window for runtime usage
  (window as any).loadHighlightLanguage = loadLanguage;
  (window as any).loadHighlightLanguages = loadLanguages;
  (window as any).getLoadedLanguages = getLoadedLanguages;
  (window as any).isLanguageLoaded = isLanguageLoaded;
  
  // Load additional languages asynchronously if requested
  if (customLanguages) {
    const unloadedLanguages = customLanguages.filter(lang => !loadedLanguages.has(lang));
    if (unloadedLanguages.length > 0) {
      loadLanguages(unloadedLanguages)
        .then(results => {
          const loaded = unloadedLanguages.filter((lang, i) => results[i]);
          if (loaded.length > 0) {
            console.log(`Loaded additional languages: ${loaded.join(', ')}`);
          }
        });
    }
  }
  
  return highlight;
};

// Export both sync and async versions for backward compatibility
export { loadLanguage, loadLanguages, getLoadedLanguages, isLanguageLoaded, AVAILABLE_LANGUAGES };
export default highlightInit;
