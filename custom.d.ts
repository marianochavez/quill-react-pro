declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "quill-better-table" {
  const QuillBetterTable: any;
  export default QuillBetterTable;
}

declare function showTitle(target: HTMLElement, title: string): void;

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.js' {
  const content: any;
  export default content;
}

declare module 'quill/assets/icons/*.svg' {
  const content: string;
  export default content;
}

// Highlight.js module declarations
declare module 'highlight.js/lib/core' {
  import hljs from 'highlight.js';
  export default hljs;
}

declare module 'highlight.js/lib/languages/*' {
  import { LanguageDefinition } from 'highlight.js';
  const language: LanguageDefinition;
  export default language;
}
