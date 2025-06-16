// Copy/paste or drag images into the rich-text editor.
/* Original adaptation from 'quill-image-drop-module', main bugs were:
    1. Quill already supports dropping Base64 images, when this module runs, dropping inserts Base64 images twice.
    2. Pasting into a table still results in Base64 images.
    3. Unable to upload to the server.
*/
import Quill, { Delta } from "quill";
import { getI18nText, i18nConfig } from "../i18n";
import { throttle } from "../utils";

interface ImageHandler {
  imgUploadApi: (formData: FormData) => Promise<string>;
  uploadSuccCB?: (url: string) => void;
  uploadFailCB?: (error: any) => void;
}

interface ImageDropOptions {
  imageHandler?: ImageHandler;
  uploadedImgsList?: string[];
  i18n?: keyof typeof i18nConfig;
}

// New Module Principle: When text changes, upload all base64 images in the editor,
// and add an "uploading" status.
// https://github.com/quilljs/quill/issues/1089#issuecomment-614313509
export class ImageDrop {
  private quill: Quill;
  private options: ImageDropOptions;
  private editorContainer: HTMLElement;
  private imageHandler?: ImageHandler;
  private uploadedImgsList: string[];

  /**
   * Instantiate the module given a quill instance and any options
   * @param quill {Quill} The Quill instance.
   * @param options {ImageDropOptions} Options for the module.
   */
  constructor(quill: Quill, options: ImageDropOptions = {}) {
    this.quill = quill; // Save the quill reference
    this.options = options;
    this.editorContainer = quill.root.parentNode as HTMLElement;
    this.imageHandler = options.imageHandler; // Add image upload method
    this.uploadedImgsList = options.uploadedImgsList || [];

    this.quill.on(
      "text-change",
      (delta: Delta, oldDelta: Delta, source: string) => {
        throttle(() => {
          const imgs: NodeListOf<HTMLImageElement> =
            this.quill.container.querySelectorAll(
              'img[src^="data:"]:not(img[data-status=uploading]):not(img[data-status=fail])'
            );

          if (imgs && imgs.length > 0) {
            imgs.forEach((img: HTMLImageElement) => {
              this.uploadBase64Img(img);
            });
          }
        })();

        this.onDelete(); // Remove formatting when image is deleted or a new line is added after an image.
      }
    );
  }

  private uploadBase64Img(img: HTMLImageElement): void {
    console.log("upload img");
    const base64Str: string | null = img.getAttribute("src");
    if (
      typeof base64Str === "string" &&
      /data:image\/.*;base64,/.test(base64Str)
    ) {
      const words = getI18nText(
        ["imgStatusUploading", "imgStatusFail"],
        this.options.i18n
      );
      img.setAttribute("data-status", "uploading");
      // Only the parent element of the image can have an 'after' pseudo-element; img cannot.
      (img.parentNode as HTMLElement).classList.add("img-container");
      (img.parentNode as HTMLElement).setAttribute("data-after", words[0]);

      const { uploadSuccCB, uploadFailCB } = this.imageHandler || {};
      this.b64ToUrl(base64Str)
        .then((url: string) => {
          img.setAttribute("src", url);
          img.setAttribute("data-status", "success");
          (img.parentNode as HTMLElement).setAttribute("data-after", "");
          this.uploadedImgsList.push(url);
          if (uploadSuccCB) uploadSuccCB(url);
        })
        .catch((error: any) => {
          console.log(error);
          img.setAttribute("data-status", "fail");
          (img.parentNode as HTMLElement).setAttribute("data-after", words[1]);
          if (uploadFailCB) uploadFailCB(error);
          (img.parentNode as HTMLElement).onclick = () =>
            this.uploadBase64Img(img);
        });
    }
  }

  private onDelete(): void {
    const allContainers: NodeListOf<HTMLElement> =
      this.quill.container.querySelectorAll(".img-container[data-after]");
    if (allContainers && allContainers.length > 0) {
      allContainers.forEach((container: HTMLElement) => {
        const imgs: NodeListOf<HTMLImageElement> =
          container.querySelectorAll('img[src^="data:"]');
        if (!imgs || imgs.length === 0) {
          container.removeAttribute("data-after");
          container.removeAttribute("class"); // Consider if removing all classes is desired or only specific ones.
        }
      });
    }
  }

  private b64ToUrl(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Split the base64 string into data and contentType
      const block = base64.split(";");
      // Get the content type of the image
      const contentType = block[0].split(":")[1];
      // Get the real base64 content of the file
      const realData = block[1].split(",")[1];
      // Convert it to a blob to upload
      const blob = ImageDrop.b64toBlob(realData, contentType);

      const { imgUploadApi } = this.imageHandler || {};
      if (imgUploadApi) {
        ImageDrop.uploadImg(
          blob,
          imgUploadApi,
          (url: string) => {
            resolve(url);
          },
          (error: any) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Image upload API is not defined."));
      }
    });
  }

  // Get all image URLs from a delta: https://github.com/quilljs/quill/issues/2041#issuecomment-492488030
  static getImgUrls(delta: Delta): string[] {
    return delta.ops
      .filter(
        (op) =>
          op.insert && typeof op.insert === "object" && "image" in op.insert
      )
      .map((op) => (op.insert as { image: string }).image);
  }

  /**
   * Convert a base64 string in a Blob according to the data and contentType.
   *
   * @param b64Data {string} Pure base64 string without contentType
   * @param contentType {string} the content type of the file i.e (image/jpeg - image/png - text/plain)
   * @param sliceSize {number} SliceSize to process the byteCharacters
   * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   * @return {Blob}
   */
  static b64toBlob(
    b64Data: string,
    contentType: string = "",
    sliceSize: number = 512
  ): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays: Uint8Array<ArrayBuffer>[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  static uploadImg = (
    blob: Blob,
    imgUploadApi: (formData: FormData) => Promise<string>,
    uploadSuccCB: (url: string) => void,
    uploadFailCB: (error: any) => void
  ): void => {
    try {
      const formData = new FormData();
      formData.append(
        "file",
        blob,
        (blob as any).name || `default.${blob.type.split("/")[1]}`
      ); // Add type assertion for name property if needed
      imgUploadApi(formData)
        .then((url: string) => {
          uploadSuccCB(url);
        })
        .catch((error: any) => {
          console.log("upload img error: ", error);
          uploadFailCB(error);
        });
    } catch (e: any) {
      console.log("uploadImg: ", e);
      uploadFailCB(e);
    }
  };
}
