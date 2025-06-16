/*
Image resizing
Mainly references quill-image-resize-module, but the original package has a lower Quill version dependency,
which leads to a larger package size (and includes lodash); additionally, Quill must be on the window object,
and adding variables in the build tool causes conflicts with syntax highlighting.
*/
import Quill from "quill";
import IconAlignLeft from "quill/assets/icons/align-left.svg";
import IconAlignCenter from "quill/assets/icons/align-center.svg";
import IconAlignRight from "quill/assets/icons/align-right.svg";
import Delete from "../assets/icons/delete.svg";
import Words from "../assets/icons/words.svg";
import { isMobile, throttle } from "../utils";
import { getI18nText, i18nConfig } from "../i18n";
import { genIconDom } from "./iconTitle/iconsConfig";

// Define types for options
interface Styles {
  [key: string]: string;
}

interface ImageResizeOptions {
  modules?: Array<string | (new (...args: any[]) => BaseModule)>;
  overlayStyles?: Styles;
  handleStyles?: Styles;
  displayStyles?: Styles;
  toolbarStyles?: Styles;
  toolbarButtonStyles?: Styles;
  toolbarButtonSvgStyles?: Styles;
  imgRemarkPre?: string;
  i18n?: keyof typeof i18nConfig;
}

const DefaultOptions: ImageResizeOptions = {
  modules: ["DisplaySize", "Toolbar", "Resize"],
  overlayStyles: {
    position: "absolute",
    boxSizing: "border-box",
    border: "1px dashed #444",
  },
  handleStyles: {
    position: "absolute",
    height: "12px",
    width: "12px",
    backgroundColor: "white",
    border: "1px solid #777",
    boxSizing: "border-box",
    opacity: "0.80",
  },
  displayStyles: {
    position: "absolute",
    font: "12px/1.0 Arial, Helvetica, sans-serif",
    padding: "4px 8px",
    textAlign: "center",
    backgroundColor: "white",
    color: "rgb(68, 68, 68)",
    border: "1px solid #777",
    boxSizing: "border-box",
    opacity: "0.80",
    cursor: "default",
  },
  toolbarStyles: {
    position: "absolute",
    top: "-12px",
    right: "0",
    left: "0",
    height: "0",
    minWidth: "100px",
    font: "12px/1.0 Arial, Helvetica, sans-serif",
    textAlign: "center",
    color: "#333",
    boxSizing: "border-box",
    cursor: "default",
  },
  toolbarButtonStyles: {
    display: "inline-block",
    width: "24px",
    height: "24px",
    background: "white",
    border: "1px solid #999",
    verticalAlign: "middle",
  },
  toolbarButtonSvgStyles: {
    fill: "#444",
    stroke: "#444",
    strokeWidth: "2",
  },
};

// Type for the ImageResize instance passed to modules
interface ResizerInstance {
  overlay: HTMLElement;
  img: HTMLImageElement;
  options: ImageResizeOptions;
  onUpdate: () => void;
  quill: Quill;
  hide: () => void;
}

class BaseModule {
  protected overlay: HTMLElement;
  protected img: HTMLImageElement;
  protected options: ImageResizeOptions;
  protected requestUpdate: () => void;

  constructor(resizer: ResizerInstance) {
    this.overlay = resizer.overlay;
    this.img = resizer.img;
    this.options = resizer.options;
    this.requestUpdate = resizer.onUpdate;

    // Create the resizer immediately if the module has an onCreate method
    this.onCreate();
  }

  /*
        requestUpdate (passed in by the library during construction, above) can be used to let the library know that
        you've changed something about the image that would require re-calculating the overlay (and all of its child
        elements)
        For example, if you add a margin to the element, you'll want to call this or else all the controls will be
        misaligned on-screen.
     */

  /*
        onCreate will be called when the element is clicked on
        If the module has any user controls, it should create any containers that it'll need here.
        The overlay has absolute positioning, and will be automatically repositioned and resized as needed, so you can
        use your own absolute positioning and the 'top', 'right', etc. styles to be positioned relative to the element
        on-screen.
     */
  onCreate(): void {}

  /*
        onDestroy will be called when the element is de-selected, or when this module otherwise needs to tidy up.
        If you created any DOM elements in onCreate, please remove them from the DOM and destroy them here.
     */
  onDestroy(): void {}

  /*
        onUpdate will be called any time that the element is changed (e.g. resized, aligned, etc.)
        This frequently happens during resize dragging, so keep computations light while here to ensure a smooth
        user experience.
     */
  onUpdate(): void {}
}

class DisplaySize extends BaseModule {
  private display: HTMLDivElement | undefined;

  onCreate = (): void => {
    // Create the container to hold the size display
    this.display = document.createElement("div");

    // Apply styles
    Object.assign(this.display.style, this.options.displayStyles);

    // Attach it
    this.overlay.appendChild(this.display);
  };

  onDestroy(): void {
    if (this.display && this.display.parentNode) {
      this.display.parentNode.removeChild(this.display);
    }
  }

  onUpdate = (): void => {
    if (!this.display || !this.img) {
      return;
    }

    const size = this.getCurrentSize();
    this.display.innerHTML = size.join(" &times; ");
    if (size[0] > 120 && size[1] > 30) {
      // position on top of image
      Object.assign(this.display.style, {
        right: "4px",
        bottom: "4px",
        left: "auto",
      });
    } else if (this.img.style.float === "right") {
      // position off bottom left
      const dispRect = this.display.getBoundingClientRect();
      Object.assign(this.display.style, {
        right: "auto",
        bottom: `-${dispRect.height + 4}px`,
        left: `-${dispRect.width + 4}px`,
      });
    } else {
      // position off bottom right
      const dispRect = this.display.getBoundingClientRect();
      Object.assign(this.display.style, {
        right: `-${dispRect.width + 4}px`,
        bottom: `-${dispRect.height + 4}px`,
        left: "auto",
      });
    }
  };

  private getCurrentSize = (): [number, number] => [
    this.img.width,
    Math.round(
      (this.img.width / this.img.naturalWidth) * this.img.naturalHeight
    ),
  ];
}

class Resize extends BaseModule {
  private isMobile: boolean = isMobile();
  private boxes: HTMLDivElement[] = [];
  private dragBox: HTMLDivElement | undefined;
  private dragStartX: number = 0;
  private preDragWidth: number = 0;

  onCreate = (): void => {
    // Add 4 resize-boxes, different cursor for each box
    this.addBox("nwse-resize"); // top left corner
    this.addBox("nesw-resize"); // top right corner
    this.addBox("nwse-resize"); // bottom right corner
    this.addBox("nesw-resize"); // bottom left corner

    // Execute repositioning of the boxes
    this.positionBoxes();
  };

  onDestroy = (): void => {
    // Remove all the boxes
    this.setCursor("");
    this.boxes.forEach((box) => {
      if (box.parentNode) {
        box.parentNode.removeChild(box);
      }
    });
  };

  onUpdate = (): void => {
    this.positionBoxes();
  };

  private positionBoxes = (): void => {
    const handleXOffset = `-6px`;
    const handleYOffset = `-6px`;

    this.boxes.forEach((box, index) => {
      Object.assign(box.style, {
        cursor: box.style.cursor,
        width: "12px",
        height: "12px",
        left:
          index % 2 === 0
            ? index < 2
              ? handleXOffset
              : `${this.img.naturalWidth - parseInt(handleXOffset, 10)}px`
            : index < 2
            ? `${this.img.naturalWidth - parseInt(handleXOffset, 10)}px`
            : handleXOffset,
        top:
          index < 2
            ? handleYOffset
            : `${this.img.naturalHeight - parseInt(handleYOffset, 10)}px`,
      });
    });
  };

  private addBox = (cursor: string): void => {
    // Create the box
    const box = document.createElement("div");
    // Copy the style
    Object.assign(box.style, this.options.handleStyles);
    Object.assign(box.style, {
      cursor,
      width: "12px",
      height: "12px",
    });

    const action = this.isMobile ? "touchstart" : "mousedown";
    // Set the cursor to indicate image is not being resized
    this.setCursor("");

    box.addEventListener(action, this.handleMousedown, false);

    // Add the box
    this.overlay.appendChild(box);
    // Keep track of this box
    this.boxes.push(box);
  };

  private handleMousedown = (evt: MouseEvent | TouchEvent): void => {
    // note which box
    this.dragBox = evt.target as HTMLDivElement;
    // note starting mousedown position
    this.dragStartX = this.isMobile
      ? (evt as TouchEvent).touches[0].clientX
      : (evt as MouseEvent).clientX;
    // store the width before the drag
    this.preDragWidth = this.img.width || this.img.naturalWidth;
    // set the proper cursor everywhere
    this.setCursor(this.dragBox.style.cursor);
    // listen for movement and mouseup
    const moveAction = this.isMobile ? "touchmove" : "mousemove";
    const upAction = this.isMobile ? "touchend" : "mouseup";
    document.addEventListener(moveAction, this.handleDrag, false);
    document.addEventListener(upAction, this.handleMouseup, false);
    evt.preventDefault();
  };

  private handleMouseup = (): void => {
    // reset cursor everywhere
    this.setCursor("");
    // stop listening for movement and mouseup
    const moveAction = this.isMobile ? "touchmove" : "mousemove";
    const upAction = this.isMobile ? "touchend" : "mouseup";
    document.removeEventListener(moveAction, this.handleDrag, false);
    document.removeEventListener(upAction, this.handleMouseup, false);
  };

  private handleDrag = (evt: MouseEvent | TouchEvent): void => {
    if (!this.dragBox) {
      return;
    }
    // update image size
    const deltaX = this.isMobile
      ? (evt as TouchEvent).touches[0].clientX - this.dragStartX
      : (evt as MouseEvent).clientX - this.dragStartX;
    const newWidth = Math.round(this.preDragWidth + deltaX);
    this.img.width = newWidth > 0 ? newWidth : 0;

    this.requestUpdate();
  };

  private setCursor = (value: string): void => {
    (document.body.style as any).cursor = value; // TODO: use CSS
  };
}

// Initialize Parchment styles function that can be called when Quill is available
let FloatStyle: any, MarginStyle: any, DisplayStyle: any;

const initializeParchmentStyles = () => {
  if (typeof Quill !== 'undefined' && Quill.imports && Quill.imports.parchment) {
const Parchment = Quill.imports.parchment as any;
    FloatStyle = new Parchment.Attributor.Style("float", "float");
    MarginStyle = new Parchment.Attributor.Style("margin", "margin");
    DisplayStyle = new Parchment.Attributor.Style("display", "display");
  } else {
    // Fallback: try again after a short delay
    setTimeout(initializeParchmentStyles, 100);
  }
};

class Toolbar extends BaseModule {
  private quill: Quill;
  private hide: () => void;
  private toolbar: HTMLDivElement | undefined;
  private alignments: {
    icon: string;
    apply: () => void;
    isApplied: () => boolean;
  }[];

  constructor(resizer: ResizerInstance) {
    super(resizer);
    this.quill = resizer.quill;
    this.hide = resizer.hide;
    this.options = resizer.options;
    this.alignments = []; // Initialize alignments here
    
    // Initialize Parchment styles if not already done
    if (!FloatStyle || !MarginStyle || !DisplayStyle) {
      initializeParchmentStyles();
    }
  }

  onCreate = (): void => {
    // Setup Toolbar
    this.toolbar = document.createElement("div");
    Object.assign(this.toolbar.style, this.options.toolbarStyles);
    this.overlay.appendChild(this.toolbar);

    // Setup Buttons
    this._defineAlignments();
    this._addToolbarButtons();
  };

  // The toolbar and its children will be destroyed when the overlay is removed
  onDestroy(): void {
    if (this.toolbar && this.toolbar.parentNode) {
      this.toolbar.parentNode.removeChild(this.toolbar);
    }
  }

  // Nothing to update on drag because we are are positioned relative to the overlay
  onUpdate(): void {}

  private _defineAlignments = (): void => {
    // Ensure Parchment styles are initialized
    if (!FloatStyle || !MarginStyle || !DisplayStyle) {
      initializeParchmentStyles();
      // If still not available, try again later
      if (!FloatStyle || !MarginStyle || !DisplayStyle) {
        setTimeout(() => this._defineAlignments(), 50);
        return;
      }
    }

    const blot = Quill.find(this.img);
    if (!blot) {
      return; // Should not happen if img is valid
    }
    const index = this.quill.getIndex(blot as any); // the index of image

    this.alignments = [
      {
        icon: IconAlignLeft,
        apply: () => {
          DisplayStyle.add(this.img, "inline");
          FloatStyle.add(this.img, "left");
          MarginStyle.add(this.img, "0 1em 1em 0");
          // For left alignment, Quill does not set 'align', setting 'align=left' can cause issues.
          this.quill.formatLine(index + 2, 1, "align", false);
        },
        isApplied: () => FloatStyle.value(this.img) === "left",
      },
      {
        icon: IconAlignCenter,
        apply: () => {
          DisplayStyle.add(this.img, "block");
          FloatStyle.remove(this.img);
          MarginStyle.add(this.img, "auto");
          this.quill.formatLine(index + 2, 1, "align", "center");
          (this.img.parentNode as HTMLElement).classList.add("img-center");
        },
        isApplied: () => MarginStyle.value(this.img) === "auto",
      },
      {
        icon: IconAlignRight,
        apply: () => {
          DisplayStyle.add(this.img, "inline");
          FloatStyle.add(this.img, "right");
          MarginStyle.add(this.img, "0 0 1em 1em");
          this.quill.formatLine(index + 2, 1, "align", "right");
          (this.img.parentNode as HTMLElement).classList.add("float-right");
        },
        isApplied: () => FloatStyle.value(this.img) === "right",
      },
      {
        icon: Words,
        apply: () => {
          let align: string | boolean = false;
          if (MarginStyle.value(this.img) === "auto") {
            align = "center";
          } else if (FloatStyle.value(this.img)) {
            align = FloatStyle.value(this.img);
          }
          const imgRemarkPre =
            this.options.imgRemarkPre ||
            getI18nText("imgRemarkPre", this.options.i18n);
          this.quill.insertText(index + 1, `\n${imgRemarkPre}`, {
            color: "#999999",
            size: "12px",
          });
          this.quill.insertText(index + 2 + imgRemarkPre.length, "\n", {
            align,
          });
          this.quill.setSelection(
            index + 2 + imgRemarkPre.length,
            Quill.sources.SILENT
          );
          this.img.setAttribute("data-remark", "1");
        },
        isApplied: () => this.img.getAttribute("data-remark") === "1",
      },
      {
        icon: Delete,
        apply: () => {
          const imageBlot = Quill.find(this.img);
          if (imageBlot) {
            (imageBlot as any)?.deleteAt(0);
          }
          this.hide();
        },
        isApplied: () => false,
      },
    ];
  };

  private _addToolbarButtons = (): void => {
    if (!this.toolbar) return; // Ensure toolbar is defined
    const buttons: HTMLSpanElement[] = [];
    const words = getI18nText(
      ["alignLeft", "alignCenter", "alignRight", "imgRemarkLabel", "deleteImg"],
      this.options.i18n
    ) as string[];

    this.alignments.forEach((alignment, idx) => {
      const button = document.createElement("span");
      buttons.push(button);
      button.innerHTML = genIconDom(alignment.icon, words[idx]);
      button.addEventListener("click", () => {
        // deselect all buttons
        buttons.forEach((bt, index) => {
          if (index !== 3) bt.style.filter = ""; // The 4th item is for remarks, it can coexist with others
        });
        if (alignment.isApplied()) {
          // If applied, unapply
          FloatStyle.remove(this.img);
          MarginStyle.remove(this.img);
          DisplayStyle.remove(this.img);
        } else {
          // otherwise, select button and apply
          this._selectButton(button);
          alignment.apply();
        }
        // image may change position; redraw drag handles
        this.requestUpdate();
      });
      Object.assign(button.style, this.options.toolbarButtonStyles);
      if (idx > 0) {
        button.style.borderLeftWidth = "0";
      }

      // Object.assign(
      //   button.children[0].style,
      //   this.options.toolbarButtonSvgStyles,
      // );
      if (alignment.isApplied()) {
        // select button if previously applied
        this._selectButton(button);
      }
      this.toolbar!.appendChild(button); // Use non-null assertion as toolbar is checked at the beginning
    });
  };

  private _selectButton(button: HTMLSpanElement): void {
    button.style.filter = "invert(20%)";
  }
}

// Define the type for knownModules as a dictionary of constructors
type KnownModules = {
  [key: string]: new (resizer: ResizerInstance) => BaseModule;
};

const knownModules: KnownModules = { DisplaySize, Toolbar, Resize };

class ImageResize {
  private quill: Quill;
  private options: ImageResizeOptions;
  private moduleClasses: Array<string | (new (...args: any[]) => BaseModule)>;
  private modules: BaseModule[] = [];
  private img: HTMLImageElement | undefined;
  private overlay: HTMLDivElement | undefined;
  private scrollThrottle: (() => void) | undefined;

  constructor(quill: Quill, options: ImageResizeOptions = {}) {
    // save the quill reference and options
    this.quill = quill;

    // Apply the options to our defaults, and stash them for later
    // defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
    let moduleClasses: Array<string | (new (...args: any[]) => BaseModule)> =
      [];
    if (options.modules) {
      moduleClasses = options.modules.slice();
    }

    // Apply options to default options
    this.options = { ...DefaultOptions, ...options };

    // (see above about moduleClasses)
    if (moduleClasses.length > 0) {
      this.options.modules = moduleClasses;
    }

    // disable native image resizing on firefox
    document.execCommand("enableObjectResizing", false, "false");

    // respond to clicks inside the editor
    this.quill.root.addEventListener("click", this.handleClick, false);

    (this.quill.root.parentNode as HTMLElement).style.position =
      (this.quill.root.parentNode as HTMLElement).style.position || "relative";

    // setup modules
    this.moduleClasses =
      (this.options.modules as Array<
        string | (new (...args: any[]) => BaseModule)
      >) || [];

    this.modules = [];
  }

  private initializeModules = (): void => {
    this.removeModules();

    this.modules = this.moduleClasses.map((ModuleClass) => {
      if (typeof ModuleClass === "string") {
        return new knownModules[ModuleClass](
          this as unknown as ResizerInstance
        );
      } else {
        return new ModuleClass(this as unknown as ResizerInstance);
      }
    });

    this.modules.forEach((module) => {
      module.onCreate();
    });

    this.onUpdate();
  };

  private onUpdate = (): void => {
    this.repositionElements();
    this.modules.forEach((module) => {
      module.onUpdate();
    });
  };

  private removeModules = (): void => {
    this.modules.forEach((module) => {
      module.onDestroy();
    });

    this.modules = [];
  };

  private handleClick = (evt: MouseEvent): void => {
    if (
      evt.target &&
      (evt.target as HTMLElement).tagName &&
      (evt.target as HTMLElement).tagName.toUpperCase() === "IMG"
    ) {
      if (this.img === evt.target) {
        // we are already focused on this image
        return;
      }
      if (this.img) {
        // we were just focused on another image
        this.hide();
      }
      // clicked on an image inside the editor
      this.show(evt.target as HTMLImageElement);
    } else if (this.img) {
      // clicked on a non image
      this.hide();
    }
  };

  private show = (img: HTMLImageElement): void => {
    // keep track of this img element
    this.img = img;

    this.showOverlay();

    this.initializeModules();
  };

  private showOverlay = (): void => {
    if (this.overlay) {
      this.hideOverlay();
    }

    // this.quill.setSelection(null);

    // prevent spurious text selection
    this.setUserSelect("none");

    // listen for the image being deleted or moved
    document.addEventListener("keyup", this.checkImage, true);
    this.quill.root.addEventListener("input", this.checkImage as any, true);

    // Create and add the overlay
    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, this.options.overlayStyles);

    (this.quill.root.parentNode as HTMLElement).appendChild(this.overlay);

    // Editor scrolling hides overlay
    this.scrollThrottle = throttle(() => {
      if (this.img && this.overlay) {
        this.hide();
      }
    });
    this.quill.root.addEventListener(
      "scroll",
      this.scrollThrottle as EventListener
    );

    this.repositionElements();
  };

  private hideOverlay = (): void => {
    if (!this.overlay) {
      return;
    }

    // Remove the overlay
    (this.quill.root.parentNode as HTMLElement).removeChild(this.overlay);
    this.overlay = undefined;

    // stop listening for image deletion or movement
    document.removeEventListener("keyup", this.checkImage);
    this.quill.root.removeEventListener("input", this.checkImage as any);
    if (this.scrollThrottle) {
      this.quill.root.removeEventListener(
        "scroll",
        this.scrollThrottle as EventListener
      );
    }

    // reset user-select
    this.setUserSelect("");
  };

  private repositionElements = (): void => {
    if (!this.overlay || !this.img) {
      return;
    }

    // position the overlay over the image
    const parent = this.quill.root.parentNode as HTMLElement;
    const imgRect = this.img.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${imgRect.top - containerRect.top + parent.scrollTop}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
    });
  };

  hide = (): void => {
    this.hideOverlay();
    this.removeModules();
    this.img = undefined;
  };

  private setUserSelect = (value: string): void => {
    ["userSelect", "mozUserSelect", "webkitUserSelect", "msUserSelect"].forEach(
      (prop) => {
        // set on contenteditable element and <html>
        (this.quill.root.style as any)[prop] = value; // Type assertion as style properties can be dynamic
        (document.documentElement.style as any)[prop] = value;
      }
    );
  };

  private checkImage = (evt: KeyboardEvent): void => {
    if (this.img) {
      if (evt.keyCode === 46 || evt.keyCode === 8) {
        // Delete or Backspace key
        const blot = Quill.find(this.img);
        if (blot) {
          // blot.deleteAt(0); // This was originally a bug, now correctly deleting blot
          const range = this.quill.getSelection();
          if (range) {
            // If there's an active selection, use it, otherwise, delete the image blot
            if (
              range.length === 0 &&
              range.index === this.quill.getIndex(blot as any)
            ) {
              (blot as any).deleteAt(0);
            } else if (range.length > 0) {
              // If selection exists, delete the selected content
              this.quill.deleteText(range.index, range.length);
            } else {
              // If no selection and caret not at image, manually delete image.
              // This part might need further refinement based on Quill's internal behavior.
              // For simplicity, directly deleting the blot.
              (blot as any).deleteAt(0);
            }
          } else {
            (blot as any).deleteAt(0);
          }
        }
      }
      this.hide();
    }
  };
}

export default ImageResize;
