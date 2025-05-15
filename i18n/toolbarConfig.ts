import { getDefaultFontList, getDefaultSizeList } from "./tableConfig";

/**
 * Get default toolbar options configuration
 * 
 * @param modules - Module configuration object
 * @param betterTable - Whether better-table is enabled
 * @returns Default toolbar options
 */
export const getDefaultToolbarOptions = (
  modules: any,
  betterTable: boolean
) => {
  return [
    ["undo", "redo", "clean"],
    [
      { font: getDefaultFontList() },
      { size: getDefaultSizeList() },
      { header: [false, 1, 2, 3, 4] },
    ],
    [
      "bold",
      "italic",
      "underline",
      "strike",
      { color: [] },
      { background: [] },
    ],
    [
      { list: "ordered" },
      { list: "bullet" },
      { list: "check" },
      { indent: "-1" },
      { indent: "+1" },
      { align: [] },
    ],
    [
      "blockquote",
      modules.codeHighlight ? "code-block" : undefined,
      modules.link !== false ? "link" : undefined,
      "image",
      { script: "sub" },
      { script: "super" },
      betterTable ? "table" : undefined,
      "divider",
    ],
  ];
}; 