import Quill from "quill";

// Custom Formats
import { Image, ListItem, DividerBlot, QSyntax } from "./customeFormats";

// Core modules
import { keyboardBindsFn } from "./keyboard";
import highlightInit from "./highlight";
import { MagicUrl } from "./magic-url";
import { ImageDrop } from "./imagePasteDrop";
import ImageResize from "./imageResize";
import MarkdownShortcuts from "./markdown-shortcuts";
import QuillBetterTable from "quill-better-table";

// Toolbar modules
import {
  toolbarInit,
  LinkHandler,
  undoHandler,
  redoHandler,
  TableHandler,
  ImageHandler,
  CodeHandler,
  DividerHandler,
} from "./toolbar";

// UI components
import { showTitle } from "./iconTitle/title";

/**
 * Register all custom formats and modules
 */
const registerQuillModules = (): void => {
  // Register custom formats
  Quill.register(Image as any, true);
  Quill.register(ListItem as any, true);
  Quill.register(DividerBlot as any, true);

  // Register modules
  Quill.register(
    {
      "modules/imageResize": ImageResize,
      "modules/imageDrop": ImageDrop,
      "modules/magicUrl": MagicUrl,
      "modules/markdownShortcuts": MarkdownShortcuts,
      "modules/tableHandler": TableHandler,
      "modules/linkHandler": LinkHandler,
      "modules/imageHandler": ImageHandler,
      "modules/codeHandler": CodeHandler,
      "modules/qSyntax": QSyntax,
      "modules/dividerHandler": DividerHandler,
    },
    true
  );
};

// Initialize all modules
registerQuillModules();

export {
  // Core functionality
  highlightInit,
  ImageDrop,
  ImageResize,
  MagicUrl,
  MarkdownShortcuts,
  QuillBetterTable,
  QSyntax,
  keyboardBindsFn,

  // Toolbar functionality
  toolbarInit,
  LinkHandler,
  TableHandler,
  ImageHandler,
  undoHandler,
  redoHandler,
  CodeHandler,
  DividerHandler,

  // UI components
  showTitle,
};
