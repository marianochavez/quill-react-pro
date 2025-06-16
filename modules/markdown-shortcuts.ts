import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed") as any;
const Block = Quill.import("blots/block");

// Type definitions
type Blot = any;
type LineBlot = any;
type RangeStatic = {
  index: number;
  length: number;
};

class HorizontalRule extends BlockEmbed {}
HorizontalRule.blotName = "hr";
HorizontalRule.tagName = "hr";

Quill.register("formats/horizontal", HorizontalRule);

interface MarkdownShortcutOptions {
  ignore?: string[];
}

interface ShortcutElement {
  name: string;
  pattern: RegExp;
  action: (
    text: string,
    selection: RangeStatic,
    pattern: RegExp,
    lineStart: number
  ) => void;
}

class MarkdownShortcuts {
  private quill: Quill;
  private options: MarkdownShortcutOptions;
  private ignoreElements: string[];
  private ignoreTags: string[];
  private matches: ShortcutElement[];

  constructor(quill: Quill, options?: MarkdownShortcutOptions) {
    this.quill = quill;
    this.options = options || {};
    this.ignoreElements = this.options.ignore || [];

    this.ignoreTags = ["PRE"];

    const elements: ShortcutElement[] = [
      {
        name: "header",
        pattern: /^(#){1,6}\s/g,
        action: (text, selection, pattern) => {
          const match = pattern.exec(text);
          if (!match) return;
          const size = match[0].length;
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 0, "header", size - 1);
            this.quill.deleteText(selection.index - size, size);
          }, 0);
        },
      },
      {
        name: "blockquote",
        pattern: /^(>)\s/g,
        action: (text, selection) => {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, "blockquote", true);
            this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        },
      },
      {
        name: "code-block",
        pattern: /^`{3}(?:\s|\n)/g,
        action: (text, selection) => {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, "code-block", true);
            this.quill.deleteText(selection.index - 4, 4);
          }, 0);
        },
      },
      {
        name: "bolditalic",
        pattern: /(?:\*|_){3}(.+?)(?:\*|_){3}/g,
        action: (text, selection, pattern, lineStart) => {
          const match = pattern.exec(text);
          if (!match) return;

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, {
              bold: true,
              italic: true,
            });
            this.quill.format("bold", false);
          }, 0);
        },
      },
      {
        name: "bold",
        pattern: /(?:\*|_){2}(.+?)(?:\*|_){2}/g,
        action: (text, selection, pattern, lineStart) => {
          const match = pattern.exec(text);
          if (!match) return;

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { bold: true });
            this.quill.format("bold", false);
          }, 0);
        },
      },
      {
        name: "italic",
        pattern: /(?:\*|_){1}(.+?)(?:\*|_){1}/g,
        action: (text, selection, pattern, lineStart) => {
          const match = pattern.exec(text);
          if (!match) return;

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { italic: true });
            this.quill.format("italic", false);
          }, 0);
        },
      },
      {
        name: "strikethrough",
        pattern: /(?:~~)(.+?)(?:~~)/g,
        action: (text, selection, pattern, lineStart) => {
          const match = pattern.exec(text);
          if (!match) return;

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { strike: true });
            this.quill.format("strike", false);
          }, 0);
        },
      },
      {
        name: "code",
        pattern: /(?:`)(.+?)(?:`)/g,
        action: (text, selection, pattern, lineStart) => {
          const match = pattern.exec(text);
          if (!match) return;

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { code: true });
            this.quill.format("code", false);
            this.quill.insertText(this.quill.getSelection()?.index || 0, " ");
          }, 0);
        },
      },
      {
        name: "hr",
        pattern: /^([-*]\s?){3}/g,
        action: (text, selection) => {
          const startIndex = selection.index - text.length;
          setTimeout(() => {
            this.quill.deleteText(startIndex, text.length);

            this.quill.insertEmbed(
              startIndex + 1,
              "hr",
              true,
              Quill.sources.USER
            );
            this.quill.insertText(startIndex + 2, "\n", Quill.sources.SILENT);
            this.quill.setSelection(startIndex + 2, Quill.sources.SILENT);
          }, 0);
        },
      },
      {
        name: "plus-ul",
        // Quill 1.3.5 already treats * as another trigger for bullet lists
        pattern: /^\+\s$/g,
        action: (text, selection) => {
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, "list", "unordered");
            this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        },
      },
      {
        name: "asterisk-ul",
        pattern: /^(\-|\*)\s$/g,
        action: (text, selection) => {
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, "list", "bullet");
            this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        },
      },
      {
        name: "image",
        pattern: /(?:!\[(.+?)\])(?:\((.+?)\))/g,
        action: (text, selection, pattern) => {
          const match = text.match(pattern);
          if (!match) return;

          const startIndex = text.search(pattern);
          const matchedText = match[0];
          const hrefLinkMatch = text.match(/(?:\((.*?)\))/g);
          const hrefLink = hrefLinkMatch ? hrefLinkMatch[0] : "";
          const start = selection.index - matchedText.length - 1;

          if (startIndex !== -1) {
            setTimeout(() => {
              this.quill.deleteText(start, matchedText.length);
              this.quill.insertEmbed(
                start,
                "image",
                hrefLink.slice(1, hrefLink.length - 1)
              );
            }, 0);
          }
        },
      },
      {
        name: "link",
        pattern: /(?:\[(.+?)\])(?:\((.+?)\))/g,
        action: (text, selection, pattern) => {
          const match = text.match(pattern);
          if (!match) return;

          const startIndex = text.search(pattern);
          const matchedText = match[0];
          const hrefTextMatch = text.match(/(?:\[(.*?)\])/g);
          const hrefText = hrefTextMatch ? hrefTextMatch[0] : "";
          const hrefLinkMatch = text.match(/(?:\((.*?)\))/g);
          const hrefLink = hrefLinkMatch ? hrefLinkMatch[0] : "";
          const start = selection.index - matchedText.length - 1;

          if (startIndex !== -1) {
            setTimeout(() => {
              this.quill.deleteText(start, matchedText.length);
              this.quill.insertText(
                start,
                hrefText.slice(1, hrefText.length - 1),
                "link",
                hrefLink.slice(1, hrefLink.length - 1)
              );
            }, 0);
          }
        },
      },
    ];

    this.matches = elements.filter(
      (element) => !this.ignoreElements.includes(element.name)
    );

    // Handler that looks for insert deltas that match specific characters
    this.quill.on("text-change", (delta, oldContents, source) => {
      for (let i = 0; i < delta.ops.length; i++) {
        if (delta.ops[i].hasOwnProperty("insert")) {
          if (delta.ops[i].insert === " ") {
            this.onSpace();
          } else if (delta.ops[i].insert === "\n") {
            this.onEnter();
          }
        } else if (delta.ops[i].hasOwnProperty("delete") && source === "user") {
          this.onDelete();
        }
      }
    });
  }

  private isValid(text: string, tagName: string): boolean {
    return !!(
      typeof text !== "undefined" &&
      text &&
      this.ignoreTags.indexOf(tagName) === -1
    );
  }

  private onSpace(): void {
    const selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = (line?.domNode as HTMLElement).textContent || "";
    const lineStart = selection.index - offset;
    if (this.isValid(text, (line?.domNode as HTMLElement).tagName)) {
      for (const match of this.matches) {
        const matchedText = text.match(match.pattern);
        // Do not activate markdown in code blocks
        // Do not activate header, list, code, blockquote, etc. in tables
        const format = this.quill.getFormat() || {};
        const disableInTable = [
          "header",
          "blockquote",
          "code-block",
          "hr",
          "plus-ul",
          "asterisk-ul",
        ];
        if (
          matchedText &&
          !format["code-block"] &&
          !(format["table-cell-line"] && disableInTable.includes(match.name))
        ) {
          // We need to replace only matched text not the whole line
          match.action(text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }

  private onEnter(): void {
    const selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = (line?.domNode as HTMLElement).textContent + " ";
    const lineStart = selection.index - offset;
    selection.length = selection.index++; // This line seems to have a logical error, index++ after assignment.
    // If `selection.index` is used immediately, it will be the old value.
    // Typically, `selection` object from Quill is immutable or should be treated as such.
    // This might need to be `selection = { index: selection.index + 1, length: selection.length };`
    // or rethink the flow. For now, preserving original logic as `selection.length = selection.index++;`
    // is a common JS pattern, though often error-prone.
    if (this.isValid(text, (line?.domNode as HTMLElement).tagName)) {
      for (const match of this.matches) {
        const matchedText = text.match(match.pattern);
        // Do not activate markdown in code blocks
        // Do not activate header, list, code, blockquote, etc. in tables
        const format = this.quill.getFormat() || {};
        const disableInTable = [
          "header",
          "blockquote",
          "code-block",
          "hr",
          "plus-ul",
          "asterisk-ul",
        ];
        if (
          matchedText &&
          !format["code-block"] &&
          !(format["table-cell-line"] && disableInTable.includes(match.name))
        ) {
          match.action(text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }

  private onDelete(): void {
    const range = this.quill.getSelection();
    if (!range) {
      return;
    }
  }

  private isLastBrElement(range: RangeStatic): boolean {
    const [block] = this.quill.scroll.descendant(Block as any, range.index) as [
      Blot | null,
      number
    ];
    const isBrElement =
      block != null && block.domNode.firstChild instanceof HTMLBRElement;
    return isBrElement;
  }

  private isEmptyLine(range: RangeStatic): boolean {
    const [line] = this.quill.getLine(range.index) as [LineBlot, number];
    const isEmpty = line.children.head?.text?.trim() === "";
    return isEmpty;
  }
}

export default MarkdownShortcuts;
