import { Range } from "quill";
import Quill from "quill";

/**
 * Interface for the keyboard handler context
 */
interface KeyboardHandlerThis {
  quill: Quill;
}

/**
 * Interface for keyboard handler options
 */
interface KeyboardOptions {
  onSave?: () => void;
}

/**
 * Interface for the context in backspace handler
 */
interface BackspaceContext {
  line: {
    parent: {
      domNode: HTMLDivElement;
    };
  };
  suffix: string;
  prefix: string;
  offset: number;
}

/**
 * Creates and returns keyboard bindings for Quill editor
 *
 * @param options - Keyboard handler options
 * @returns Object containing keyboard bindings
 */
export const keyboardBindsFn = (options: KeyboardOptions = {}) => {
  const { onSave } = options;

  return {
    /**
     * Custom handler for ordered list creation
     * Allows starting lists with any number (e.g., "30. ")
     */
    "list autofill": {
      key: " ",
      collapsed: true,
      prefix: /^\d+\.$/,
      format: {
        list: false,
        "code-block": false,
        blockquote: false,
        header: false,
        table: false,
        "table-cell-line": false, // Don't trigger ordered list in tables
      },
      handler(this: KeyboardHandlerThis, range: Range, context: any) {
        const { prefix } = context;
        const start = parseInt(prefix.replace(".", ""), 10);

        if (start !== 1) {
          // Format with custom start number
          this.quill.formatLine(range.index, 1, "list", `ordered-${start}`);
          this.quill.formatLine(range.index, 1, "list", `ordered-${start}`);
        } else {
          // Format with default start (1)
          this.quill.formatLine(range.index, 1, "list", "ordered");
          this.quill.formatLine(range.index, 1, "list", "ordered");
        }

        // Remove the prefix text that triggered the formatting
        this.quill.deleteText(range.index - prefix.length, prefix.length);
      },
    },

    /**
     * Custom backspace handler for code blocks, lists, and blockquotes
     * Fixes the issue where you can't remove formatting with backspace
     */
    "code backspace": {
      key: "Backspace",
      format: ["code-block", "list", "blockquote"],
      handler(
        this: KeyboardHandlerThis,
        range: Range,
        context: BackspaceContext
      ) {
        if (!this.quill) return true;

        const format = this.quill.getFormat(range);

        // For code blocks, check if the entire block is empty
        if (format["code-block"]) {
          const allCode = context?.line?.parent?.domNode?.innerHTML
            .replace(/<select>(.+)<\/span><\/span>/, "")
            .replace(/<[^<>]+>/g, "");

          if (allCode === "\n" || allCode === "" || allCode === undefined) {
            // If code block is empty, remove formatting
            this.quill.removeFormat(range.index, range.length);
            return false;
          }
        }
        // For lists and blockquotes, check if cursor is at the beginning of the line
        else if (
          (format["list"] || format["blockquote"]) &&
          context.prefix === ""
        ) {
          this.quill.removeFormat(range.index, range.length);
          return false;
        }

        // Default behavior
        return true;
      },
    },

    /**
     * Save handler (Ctrl+S / Cmd+S)
     */
    save: {
      key: "s",
      shortKey: true,
      handler(this: KeyboardHandlerThis) {
        if (onSave) {
          onSave();
          return false;
        }
        return true;
      },
    },
  };
};
