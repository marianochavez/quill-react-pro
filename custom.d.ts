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
