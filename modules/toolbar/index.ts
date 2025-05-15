import Quill from "quill";
import { i18nConfig } from "../../i18n";
import { showTitle } from "../iconTitle/title";
import { throttle } from "../../utils";

// Export all toolbar handlers
export { LinkHandler } from "./link";
export { default as TableHandler } from "./table";
export { default as ImageHandler } from "./image";
export { default as CodeHandler } from "./code";
export { default as DividerHandler } from "./divider";

/**
 * Initialize toolbar with proper i18n labels
 *
 * @param quill - Quill editor instance
 * @param i18n - Language key for i18n
 */
export const toolbarInit = (quill: Quill, i18n: keyof typeof i18nConfig) => {
  const container = (quill.getModule("toolbar") as any).container;
  if (!container) return;

  // Set toolbar i18n labels using CSS data-before attribute
  const fontLabels = [
    {
      selector: '.ql-toolbar .ql-font .ql-picker-label[data-value="system"]',
      key: "toolbarFont" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-item[data-value="system"]',
      key: "toolbarFont" as const,
    },
    {
      selector: ".ql-snow .ql-picker.ql-header .ql-picker-item",
      key: "toolbarHeader" as const,
    },
    {
      selector: ".ql-snow .ql-picker.ql-header .ql-picker-label",
      key: "toolbarHeader" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-label[data-value="wsYaHei"]',
      key: "fontYahei" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-item[data-value="wsYaHei"]',
      key: "fontYahei" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-label[data-value="songTi"]',
      key: "fontSong" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-item[data-value="songTi"]',
      key: "fontSong" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-label[data-value="kaiTi"]',
      key: "fontKai" as const,
    },
    {
      selector: '.ql-toolbar .ql-font .ql-picker-item[data-value="kaiTi"]',
      key: "fontKai" as const,
    },
  ];

  // Apply i18n labels to all elements
  fontLabels.forEach(({ selector, key }) => {
    const element = container.querySelector(selector);
    if (element) {
      element.setAttribute("data-before", i18nConfig[i18n][key]);
    }
  });

  // Add global tooltip function
  window.showTitle = showTitle;
};

/**
 * Undo handler for toolbar
 *
 * @param quill - Quill editor instance
 */
export const undoHandler = (quill: Quill) => {
  quill?.history?.undo();
};

/**
 * Redo handler for toolbar
 *
 * @param quill - Quill editor instance
 */
export const redoHandler = (quill: Quill) => {
  quill?.history?.redo();
};

/**
 * Input handler with throttling for dialog inputs
 *
 * @param input - Input element to handle
 * @param changeCallback - Callback function when input changes
 */
export const inputHandler = (
  input: HTMLInputElement,
  changeCallback: (value: string) => void
) => {
  if (!input) return;

  // Prevent event bubbling to avoid closing dialog
  input.onclick = (e) => {
    e.stopPropagation();
  };

  // Handle input changes with throttling
  input.oninput = throttle(() => {
    if (changeCallback) changeCallback(input.value);
  }, 400);
};
