# quill-react-pro

**A Professional-Grade Quill Rich Text Editor for React**

This project is a fork and enhancement of the original `quill-react-commercial` library by ludejun, aiming to provide a robust, customizable, and production-ready Quill rich text editor component for React applications. It leverages the power of [Quill](https://github.com/quilljs/quill) with a focus on improved user experience, modern development practices, and extended features.

![quill-react-pro](https://cdn.jsdelivr.net/gh/ludejun/quill-react-commercial/example/images/quill-react-commercial.jpg)
_(Note: Image from original repository. Links will be updated as the project evolves.)_

## Features

- **Latest Quill Version:** Built upon quill@2.0.2 (or the latest stable version at the time of updates).
- **React Hooks & TypeScript:** Modern implementation using React Hooks, with TypeScript support for better development experience and type safety.
- **Efficient Bundling:** Packaged with Rollup for optimized builds.
- **Enhanced Image Handling:**
  - Supports local image uploads and insertion via URL.
  - Pre-upload checks for image format and size.
  - All images can be displayed as Base64 and uploaded remotely in the background.
  - Retry failed uploads with a click.
  - Supports copying and dragging images for insertion.
  - Image resizing, alignment, captioning/notes, and deletion.
  - Overlays on images are removed when scrolling.
- **Improved Link Tooltip:** Refactored link tooltip with more actions.
- **Markdown Support:** Directly input Markdown and have it converted to rich text.
- **Advanced Code Blocks:**
  - Language selection for syntax highlighting.
  - Copy-to-clipboard functionality.
  - Code line numbering.
- **Enhanced Tables:**
  - Toolbar for easy selection of table size.
  - Right-click context menu for more table operations.
  - New, intuitive icons.
- **Multilingual Tooltips:** Informative tooltips on icon hover, primarily in English.
- **Internationalization (i18n):** Core support for multiple languages, with English as the default. The original library supported Chinese and Spanish; contributions for maintaining and expanding translations are welcome.
- **Improved IME Handling:** Placeholders disappear correctly when using Input Method Editors (e.g., Pinyin).
- **Auto-linking:** Automatically recognizes typed or pasted URLs and converts them to active links (LinkBlot).
- **Bug Fixes:** Addresses various issues from the original or base Quill, such as:
  - Inputting lists within tables.
  - Uploading images within tables.
  - Recognition of ordered lists.
  - Deletion of block elements like code blocks and tables.
  - Preserving image locations.

## Installation

```shell
npm install quill-react-pro --save
# or
yarn add quill-react-pro
```

## Quick Start

```javascript
import React from "react";
import RichTextEditor from "quill-react-pro";
import "quill-react-pro/lib/index.css"; // Ensure you have the CSS

function MyEditor() {
  // Example modules configuration
  const modules = {
    table: {}, // Enable table module with default options
    codeHighlight: true, // Enable code highlighting
    // Add other modules as needed
  };

  return (
    <RichTextEditor modules={modules} placeholder="Start typing here..." />
  );
}

export default MyEditor;
```

**UMD / CDN Usage:**
The component will be available under `window.QuillReactPro` (or a similar name, check the UMD build output).
Refer to the `example` folder in the repository for a demonstration.

```html
<script src="path/to/your/quill-react-pro.min.js"></script>
<link rel="stylesheet" href="path/to/your/quill-react-pro.css" />
```

## Usage

### Properties (Refer to TypeScript definitions for full details)

##### 1\. `modules`: `object` (Required)

Object to configure Quill modules. Each key can be set to `false` if not needed.

```javascript
const modules = {
  codeHighlight: true, // Enables syntax highlighting for code blocks
  table: {
    // Enables table functionality
    operationMenu: {
      // Customize context menu items (optional)
      insertColumnRight: { text: "Insert Column Right" },
      // ... other operations (see default values below)
    },
    backgroundColors: {
      // Customize table cell background colors
      colors: ["#4a90e2", "#999", "#ffffff", "#000000"], // Default: ['#dbc8ff', '#6918b4', '#4a90e2', '#999', '#fff']
      text: "Background Colors", // Default: 'Background Colors'
    },
    toolBarOptions: {
      // Configuration for the table creation dialog
      dialogRows: 3, // Default: 9
      dialogColumns: 4, // Default: 9
      i18n: "en", // Language for the dialog, 'en', 'es', 'zh'
    },
  },
  imageResize: true, // Default: true
  imageDrop: true, // Default: true (allows dropping images)
  magicUrl: true, // Default: true (auto-detects and links URLs/emails)
  markdown: true, // Default: true (converts Markdown to rich text)
  link: true, // Default: true (basic link functionality)
  imageHandler: {
    imgUploadApi: async (formData) => {
      /* ... */
    }, // Function for custom image upload. Must return a Promise<string> (the image URL).
    uploadSuccCB: (responseData) => {
      /* ... */
    }, // Callback on successful upload
    uploadFailCB: (error) => {
      /* ... */
    }, // Callback on failed upload
    imgRemarkPre: "Fig. ", // Prefix for image remarks/captions (can be deleted by user)
    maxSize: 2, // Maximum local image upload size in MB (Default: 5MB)
    imageAccept:
      "image/png, image/gif, image/jpeg, image/bmp, image/x-icon, image/webp", // Accepted image types
  },
  toolbarOptions: [
    /* ... */
  ], // Customize toolbar icons and their order (see Quill.js documentation)
};
```

**Default `modules.table.operationMenu`:**

```javascript
{
  insertColumnRight: { text: 'Insert Column Right' },
  insertColumnLeft: { text: 'Insert Column Left' },
  insertRowUp: { text: 'Insert Row Above' },
  insertRowDown: { text: 'Insert Row Below' },
  mergeCells: { text: 'Merge Selected Cells' },
  unmergeCells: { text: 'Unmerge Cells' },
  deleteColumn: { text: 'Delete Columns' },
  deleteRow: { text: 'Delete Rows' },
  deleteTable: { text: 'Delete Table' },
}
```

_(Note: Image from original repository)_

**`modules.imageHandler`:** If not defined, inserted images are converted to base64 and stored in the Delta.
_(Note: Image from original repository)_

**Example `modules.toolbarOptions`:** (Refer to [Quill Toolbar Module Documentation](https://quilljs.com/docs/modules/toolbar/))

```javascript
const toolbarOptions = [
  ["undo", "redo", "clean"],
  [
    {
      font: ["Arial", "Times New Roman", "Courier New", "serif", "sans-serif"],
    }, // Customize fonts
    { size: ["small", false, "large", "huge"] }, // Use Quill's named sizes or specific px values
  ],
  [{ color: [] }, { background: [] }],
  ["bold", "italic", "underline", "strike"],
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
    "code-block",
    "link",
    "image",
    { script: "sub" },
    { script: "super" },
    "table",
    "divider", // Custom divider if implemented
  ],
];
```

**Default `modules.codeHighlight` languages:** (You can customize this)

```javascript
[
  { key: "plain", label: "Plain Text" },
  { key: "javascript", label: "JavaScript" },
  { key: "java", label: "Java" },
  { key: "python", label: "Python" },
  { key: "cpp", label: "C++/C" },
  { key: "csharp", label: "C#" },
  { key: "php", label: "PHP" },
  { key: "sql", label: "SQL" },
  { key: "json", label: "JSON" },
  { key: "bash", label: "Bash/Shell" },
  { key: "go", label: "Go" },
  { key: "objectivec", label: "Objective-C" },
  { key: "xml", label: "HTML/XML" },
  { key: "css", label: "CSS" },
  { key: "ruby", label: "Ruby" },
  { key: "swift", label: "Swift" },
  { key: "scala", label: "Scala" },
];
```

##### 2\. `placeholder`: `string` (Optional)

Placeholder text for the editor when it's empty.

##### 3\. `getQuill`: `(quillInstance: Quill) => void` (Optional)

Callback function to get the Quill instance. You can use this to call Quill's API methods.
[Quill API Documentation](https://quilljs.com/docs/api/)

```jsx
import React, { useRef } from "react";
// ...
const quillRef = useRef(null);
const handleGetQuill = (quillInstance) => {
  quillRef.current = quillInstance;
};

// Example usage later:
// const content = quillRef.current?.getContents();
// const text = quillRef.current?.getText();
```

##### 4\. `content`: `Delta | string` (Optional)

Initial content for the editor. Can be a Quill Delta object or an HTML string.

```jsx
// Using Delta
<RichTextEditor modules={/*...*/} content={{ ops: [{ insert: "Hello quill-react-pro!\n" }] }} />

// Using HTML string
<RichTextEditor modules={/*...*/} content={'<h1>Hello quill-react-pro!</h1>'} />
```

##### 5\. `readOnly`: `boolean` (Optional)

Set to `true` to make the editor read-only. Default: `false`.

##### 6\. `onChange`: `(content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => void` (Optional)

Callback function triggered when the editor's content changes.
Refer to Quill's `text-change` event documentation.

##### 7\. `onFocus`: `(range: Range, source: Sources, editor: UnprivilegedEditor) => void` (Optional)

Callback function triggered when the editor gains focus.

##### 8\. `onBlur`: `(previousRange: Range, source: Sources, editor: UnprivilegedEditor) => void` (Optional)

Callback function triggered when the editor loses focus.

##### 9\. `i18n`: `'en' | 'zh' | 'es'` (Optional)

Sets the language for UI elements like tooltips. Default: `'en'`. Other languages like `'zh'` (Chinese) and `'es'` (Spanish) might have partial support carried over from the original library; contributions are welcome.

##### 10\. `style`: `React.CSSProperties` (Optional)

```
Custom CSS styles to apply to the editor's container.
```

##### 11\. `onSave`: `() => void` (Optional)

```
A callback function that can be triggered by a save action (e.g., a custom save button in the toolbar or Ctrl+S, if implemented).
```

##### 12\. `theme`: `'snow' | 'bubble'` (Optional)

```
Specifies the Quill theme to use. Default: `'snow'`.
```

## Advanced Topics

### Customizing Code Highlighting Styles

`quill-react-pro` uses `highlight.js` for syntax highlighting. By default, it might use a style like `xcode.css`. You can easily switch to other `highlight.js` themes:

1.  **Install or link a `highlight.js` theme CSS:**
    ```css
    /* For example, in your main CSS file or imported globally in your app */
    import 'highlight.js/styles/darcula.css'; /* Or any other theme */
    ```
    Or via CDN:
    ```html
    <link
      rel="stylesheet"
      href="//[cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css)"
    />
    ```

## Development & Contributing

This project is a fork of `quill-react-commercial` by `ludejun`. We thank the original author for their significant contributions.

Contributions to `quill-react-pro` are welcome\!

**Local Development Setup:**

1.  Clone this repository (`marianochavez/quill-react-pro`).
2.  Install dependencies: `yarn install` or `npm install`.
3.  To build and watch the library for local development with the example:
    ```shell
    yarn example # (or npm run example)
    ```
    This command typically builds the library and serves an example `index.html` page where you can test your changes.
    - Modifying the editor's core JS/Less files usually enables hot updates (browser refresh might be needed).
    - Changes to the example files (`example/app.js`) might require re-running the `yarn example` command if not automatically re-babelized/re-bundled.

**Pull Requests:**

- Please ensure your code follows the existing style and that all tests (if available) pass.
- Provide a clear description of your changes.

## License

This project is licensed under the **ISC License**, the same license as the original `quill-react-commercial` project.

**Original Copyright:**
Copyright (c) 2017-2025, Lu Dejun. All rights reserved.

**Modifications Copyright:**
Modifications copyright (c) 2024-Present, Mariano Chavez (`amarianochavez@gmail.com`).

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1.  Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

2.  Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

3.  Neither the name of the original copyright holder nor the names of its
    contributors, nor the name 'Mariano Chavez' or 'quill-react-pro' may be used to
    endorse or promote products derived from this software without specific
    prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.