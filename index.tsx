import React, { useRef, useEffect, CSSProperties, FC } from "react";
import Quill, { Range, EmitterSource } from "quill";
import Delta from "quill-delta";

// Import all modules from a single entry point
import {
  highlightInit,
  QuillBetterTable,
  toolbarInit,
  undoHandler,
  redoHandler,
  keyboardBindsFn,
} from "./modules/index";

// Utils and helpers
import { optionDisableToggle, setContent, throttle } from "./utils";

// Import i18n configurations
import {
  getTableConfig,
  getCodeLanguages,
  getDefaultFontList,
  getDefaultSizeList,
  getDefaultToolbarOptions,
  getDefaultLanguage,
  isLanguageSupported,
  i18nConfig,
  getI18nText,
} from "./i18n";

// Icons
import IconUndo from "quill/assets/icons/undo.svg";
import IconRedo from "quill/assets/icons/redo.svg";
import IconDivider from "./assets/icons/divider.svg";

// Styles
import "quill/dist/quill.snow.css";
import "quill-better-table/dist/quill-better-table.css";
import "./assets/richTextEditor.less";
import "./assets/modules.less";
import "./assets/toolbar.less";

// Types
interface IBetterTable {
  operationMenu?: {
    insertColumnRight?: {
      text: string;
    };
    insertColumnLeft?: {
      text: string;
    };
    insertRowUp?: {
      text: string;
    };
    insertRowDown?: {
      text: string;
    };
    mergeCells?: {
      text: string;
    };
    unmergeCells?: {
      text: string;
    };
    deleteColumn?: {
      text: string;
    };
    deleteRow?: {
      text: string;
    };
    deleteTable?: {
      text: string;
    };
  };
  backgroundColors?: {
    colors?: string[];
    text?: string;
  };
  toolbarOptions?: {
    dialogRows?: number;
    dialogColumns?: number;
    i18n?: "en" | "zh" | "es";
  };
}

interface IModules {
  table?: boolean | IBetterTable;
  codeHighlight?: boolean | { key: string; label: string }[];
  imageResize?: boolean | {};
  imageDrop?: boolean | {};
  magicUrl?: boolean;
  markdown?: boolean;
  link?: boolean | {};
}

interface IEditorProps {
  placeholder?: string;
  readOnly?: boolean;
  modules?: {
    imageHandler?: {
      imgUploadApi?: (formData: any) => Promise<string>;
      uploadSuccCB?: (data: unknown) => void;
      uploadFailCB?: (error: unknown) => void;
      imgRemarkPre?: string;
      maxSize?: number;
      imageAccept?: string;
    };
    toolbarOptions?: [][];
  } & IModules;
  getQuill?: (quill: Quill, uploadedImgsList?: string[]) => void;
  content?: Delta | string;
  onChange?: (delta: Delta, old: Delta) => void;
  onFocus?: (range?: Range) => void;
  onBlur?: (oldRange?: Range) => void;
  onSave?: () => void;
  i18n?: "en" | "zh" | "es";
  style?: CSSProperties;
  theme?: "bubble" | "snow";
}

const RichTextEditor: FC<IEditorProps> = (props) => {
  const {
    modules = {},
    content,
    i18n: userI18n,
    style = {},
    readOnly = false,
    theme = "snow",
  } = props;

  // Use provided i18n or default language, ensuring it's supported
  const i18n =
    userI18n && isLanguageSupported(userI18n)
      ? (userI18n as keyof typeof i18nConfig)
      : (getDefaultLanguage() as keyof typeof i18nConfig);

  const quillModules = useRef<
    IModules & {
      "better-table"?: Record<string, unknown>;
      tableHandler?: IBetterTable["toolbarOptions"] | boolean;
      syntax?: any;
      markdownShortcuts?: boolean;
      linkHandler?: boolean | { i18n: keyof typeof i18nConfig };
      imageHandler?: (IEditorProps["modules"] & {})["imageHandler"] & {
        i18n: keyof typeof i18nConfig;
      };
      qSyntax?: any;
      codeHandler?: boolean | string;
      dividerHandler?: boolean | {};
    }
  >({});

  const toolbarHandlers = useRef<Record<string, unknown>>({});
  const quillRef = useRef<
    Quill & {
      theme?: Record<string, any>;
    }
  >();
  const editorId = useRef<string>(
    new Date().getTime() + (100 * Math.random()).toFixed(0)
  );
  const uploadedImgsList = useRef<string[]>([]); // 已上传图片，主要给onComplete使用，可以用来判断哪些已上传图片实际并没有被使用

  // Initialize modules based on props
  useEffect(() => {
    initializeModules();
    setupFontAndSizeOptions();
    setupQuillIcons();
  }, [modules]);

  // Initialize Quill editor
  useEffect(() => {
    initializeQuillEditor();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Update content when it changes
  useEffect(() => {
    if (content && quillRef.current) {
      setContent(content, quillRef.current);
    }
  }, [content]);

  // Update readOnly state
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  /**
   * Initialize all modules based on props configuration
   */
  const initializeModules = () => {
    if (Object.keys(modules).length === 0) return;

    const {
      table,
      codeHighlight,
      imageResize = true,
      imageDrop = true,
      magicUrl = true,
      markdown = true,
      link = true,
      imageHandler,
    } = modules;

    // Setup table module
    if (table) {
      setupTableModule(table);
    }

    // Setup code highlight module
    if (codeHighlight) {
      setupCodeHighlightModule(codeHighlight);
    }

    // Setup image modules
    if (imageResize) {
      quillModules.current.imageResize =
        imageResize === false
          ? imageResize
          : {
              i18n,
              ...(typeof imageResize === "object" ? imageResize : null),
            };
    }

    // Setup image drop module
    if (imageDrop) {
      quillModules.current.imageDrop =
        imageDrop === false
          ? imageDrop
          : {
              i18n,
              imageHandler,
              uploadedImgsList: uploadedImgsList.current,
              ...(typeof imageDrop === "object" ? imageDrop : null),
            };
    }

    // Setup other modules
    quillModules.current.magicUrl = magicUrl;
    quillModules.current.markdownShortcuts = markdown;

    // Setup toolbar handlers
    if (link) {
      quillModules.current.linkHandler = { i18n };
    }
    quillModules.current.imageHandler = { i18n, ...imageHandler };
    quillModules.current.codeHandler = true;
    quillModules.current.dividerHandler = { i18n };

    // Setup undo/redo handlers
    toolbarHandlers.current.undo = () => undoHandler(quillRef.current!);
    toolbarHandlers.current.redo = () => redoHandler(quillRef.current!);
  };

  /**
   * Setup table module with proper i18n and options
   */
  const setupTableModule = (table: boolean | IBetterTable) => {
    quillModules.current.table = false;

    // Get table configuration based on i18n
    const tableConfig = getTableConfig(i18n);

    quillModules.current["better-table"] = {
      i18n,
      operationMenu: {
        items:
          (typeof table !== "boolean" && table.operationMenu) ||
          tableConfig.operationMenu.items,
        color: {
          colors: tableConfig.backgroundColors.colors,
          text: tableConfig.backgroundColors.text,
          ...(typeof table !== "boolean" ? table.backgroundColors : null),
        },
      },
    };

    quillModules.current.tableHandler = {
      i18n,
      ...(typeof table !== "boolean" ? table.toolbarOptions : {}),
    };
  };

  /**
   * Setup code highlight module with languages
   */
  const setupCodeHighlightModule = (
    codeHighlight: boolean | { key: string; label: string }[]
  ) => {
    quillModules.current.qSyntax = {
      i18n,
      hljs: highlightInit(),
      languages:
        typeof codeHighlight !== "boolean" ? codeHighlight : getCodeLanguages(),
    };
  };

  /**
   * Setup font and size options for Quill
   */
  const setupFontAndSizeOptions = () => {
    const { toolbarOptions } = modules;
    let fontList = getDefaultFontList();
    let sizeList = getDefaultSizeList();

    if (toolbarOptions) {
      toolbarOptions.forEach((formats) => {
        if (Array.isArray(formats)) {
          formats.forEach((format: { font?: []; size?: [] }) => {
            if (typeof format === "object") {
              if (format.font && Array.isArray(format.font)) {
                fontList = format.font;
              }
              if (format.size && Array.isArray(format.size)) {
                sizeList = format.size;
              }
            }
          });
        }
      });
    }

    const SizeStyle = Quill.import("attributors/style/size") as any;
    SizeStyle.whitelist = sizeList;
    Quill.register(SizeStyle, true);

    const FontStyle = Quill.import("formats/font") as any;
    FontStyle.whitelist = fontList;
    Quill.register(FontStyle, true);
  };

  /**
   * Setup Quill icons
   */
  const setupQuillIcons = () => {
    const icons = Quill.import("ui/icons") as any;
    icons.undo = IconUndo;
    icons.redo = IconRedo;
    icons.divider = IconDivider;
  };

  /**
   * Initialize the Quill editor with all modules and handlers
   */
  const initializeQuillEditor = () => {
    const { placeholder, getQuill, onChange, onFocus, onBlur, onSave } = props;

    // Register QuillBetterTable if needed
    if (quillModules.current["better-table"]) {
      Quill.register(
        {
          "modules/better-table": QuillBetterTable,
        },
        true
      );
    }

    const lineBreakMatcher = () => {
      const newDelta = new Delta();
      newDelta.insert({ break: "" });
      return newDelta;
    };

    // Setup toolbar options
    const toolbarOptions =
      modules.toolbarOptions ||
      getDefaultToolbarOptions(modules, !!quillModules.current["better-table"]);

    // Initialize Quill
    quillRef.current = new Quill(`#editor${editorId.current}`, {
      debug: false,
      modules: {
        ...quillModules.current,
        toolbar: {
          container: toolbarOptions,
          handlers: {
            ...toolbarHandlers.current,
          },
        },
        clipboard: {
          matchers: [["BR", lineBreakMatcher]],
        },
        keyboard: {
          bindings: {
            ...QuillBetterTable.keyboardBindings,
            ...keyboardBindsFn({
              onSave,
            }),
          },
        },
        history: {
          delay: 2000,
          maxStack: 100,
          userOnly: true,
        },
      },
      placeholder: placeholder || (getI18nText("placeholder", i18n) as string),
      readOnly,
      bounds: document.querySelector(
        `#editor${editorId.current}`
      ) as HTMLElement,
      theme,
    });

    // Initialize toolbar
    toolbarInit(quillRef.current, i18n);

    // Setup selection change handler
    setupSelectionChangeHandler();

    // Set initial content if provided
    content && setContent(content, quillRef.current);

    // Pass Quill instance to parent if needed
    getQuill && getQuill(quillRef.current, uploadedImgsList.current);

    // Setup change handlers
    setupChangeHandlers(onChange, onFocus, onBlur);

    // Fix Chinese input placeholder issue
    fixChineseInputPlaceholderIssue(placeholder);
  };

  /**
   * Setup selection change handler
   */
  const setupSelectionChangeHandler = () => {
    if (!quillRef.current) return;

    quillRef.current.on(
      "selection-change",
      (range: Range, oldRange: Range, source: EmitterSource) => {
        if (range == null || !quillRef.current?.hasFocus()) return;

        // When creating or selecting a table, disable certain toolbar options
        if (modules.table && quillRef.current) {
          const disableInTable = [
            "header",
            "blockquote",
            "code-block",
            "hr",
            "list",
          ];
          const format = quillRef.current.getFormat() || {};
          if (format && format["table-cell-line"]) {
            optionDisableToggle(quillRef.current, disableInTable, true);
          } else {
            optionDisableToggle(quillRef.current, disableInTable, false);
          }
        }
      }
    );
  };

  /**
   * Setup change handlers for text and selection changes
   */
  const setupChangeHandlers = (
    onChange?: (delta: Delta, old: Delta) => void,
    onFocus?: (range?: Range) => void,
    onBlur?: (oldRange?: Range) => void
  ) => {
    if (!quillRef.current) return;

    if (onChange) {
      quillRef.current.on(
        "text-change",
        (delta: Delta, old: Delta, source: EmitterSource) => {
          source === "user" && onChange(delta, old);
        }
      );
    }

    if (onFocus || onBlur) {
      quillRef.current.on(
        "selection-change",
        (range: Range, oldRange: Range, source: EmitterSource) => {
          const hasFocus = range && !oldRange;
          const hasBlur = !range && oldRange;
          if (onFocus && hasFocus) onFocus(range);
          if (onBlur && hasBlur) onBlur(oldRange);
        }
      );
    }
  };

  /**
   * Fix Chinese input placeholder issue
   */
  const fixChineseInputPlaceholderIssue = (placeholder?: string) => {
    if (!quillRef.current) return;

    const dom = document
      .getElementById(`editor${editorId.current}`)!
      .querySelector(".ql-editor");

    dom!.addEventListener(
      "input",
      throttle(() => {
        if (
          (dom as HTMLElement).innerText !== "\n" &&
          dom!.classList.contains("ql-blank")
        ) {
          quillRef.current!.root.setAttribute("data-placeholder", "");
        } else if ((dom as HTMLElement).innerText === "\n") {
          quillRef.current!.root.setAttribute(
            "data-placeholder",
            placeholder || (getI18nText("placeholder", i18n) as string)
          );
        }
      }, 100)
    );

    quillRef.current.on(
      "text-change",
      throttle(() => {
        if (
          quillRef.current!.getText() === "\n" &&
          quillRef.current!.root.getAttribute("data-placeholder") === ""
        ) {
          quillRef.current!.root.setAttribute(
            "data-placeholder",
            placeholder || (getI18nText("placeholder", i18n) as string)
          );
        }
      })
    );
  };

  return (
    <div className="ql-editor-container" style={style}>
      <div id={`editor${editorId.current}`} />
    </div>
  );
};

export default RichTextEditor;
