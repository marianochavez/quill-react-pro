# quill-react-pro

**A Professional-Grade Quill Rich Text Editor for React**

This project is a fork and enhancement of the original `quill-react-commercial` library by ludejun, aiming to provide a robust, customizable, and production-ready Quill rich text editor component for React applications. It leverages the power of [Quill](https://github.com/quilljs/quill) with a focus on improved user experience, modern development practices, and extended features.

![quill-react-pro](https://cdn.jsdelivr.net/gh/ludejun/quill-react-commercial/example/images/quill-react-commercial.jpg)
_(Note: Image from original repository. Links will be updated as the project evolves.)_

## Features

- **Latest Quill Version:** Built upon quill@2.0.2.
- **React Hooks & TypeScript:** Modern implementation using React Hooks with TypeScript support.
- **Efficient Bundling:** Packaged with Rollup for optimized builds.
- **Enhanced Image Handling:**
  - Support for local image uploads and URL insertion
  - Pre-upload checks for image format and size
  - Base64 image display with background remote uploads
  - Failed upload retry functionality
  - Image insertion via copy/paste and drag-and-drop
  - Image resizing, alignment, captioning, and deletion
- **Improved Link Handling:** Enhanced link tooltip with extended actions
- **Markdown Support:** Direct Markdown input conversion to rich text
- **Advanced Code Blocks:**
  - Language selection for syntax highlighting
  - Copy-to-clipboard functionality
  - Code line numbering
- **Enhanced Tables:**
  - Toolbar for table size selection
  - Context menu for table operations
  - Modern table editing icons
- **Multilingual Support:** Tooltips and UI text in English, Spanish, and Chinese
- **Improved IME Handling:** Better support for Input Method Editors
- **Auto-linking:** Automatic URL detection and linking
- **Various Bug Fixes:** Solutions for issues from the original implementation

## Installation

```shell
npm install quill-react-pro --save
```

## Quick Start

```javascript
import React from "react";
import RichTextEditor from "quill-react-pro";
import "quill-react-pro/lib/style.css"; // Import the styles

function MyEditor() {
  // Basic modules configuration
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
The component is available as `window.QuillReactPro` in UMD builds.

```html
<script src="path/to/your/quill-react-pro.min.js"></script>
<link rel="stylesheet" href="path/to/your/quill-react-pro.css" />
```

## API Reference

### Props

| Prop          | Type               | Required | Default  | Description                           |
| ------------- | ------------------ | -------- | -------- | ------------------------------------- |
| `modules`     | `object`           | Yes      | -        | Configuration for Quill modules       |
| `placeholder` | `string`           | No       | -        | Placeholder text when editor is empty |
| `getQuill`    | `function`         | No       | -        | Callback to access Quill instance     |
| `content`     | `Delta\|string`    | No       | -        | Initial content (Delta or HTML)       |
| `readOnly`    | `boolean`          | No       | `false`  | Makes editor read-only                |
| `onChange`    | `function`         | No       | -        | Change event handler                  |
| `onFocus`     | `function`         | No       | -        | Focus event handler                   |
| `onBlur`      | `function`         | No       | -        | Blur event handler                    |
| `onSave`      | `function`         | No       | -        | Save action handler                   |
| `i18n`        | `'en'\|'zh'\|'es'` | No       | `'en'`   | UI language                           |
| `style`       | `CSSProperties`    | No       | `{}`     | Custom container styles               |
| `theme`       | `'snow'\|'bubble'` | No       | `'snow'` | Quill theme                           |

### Modules Configuration

```javascript
const modules = {
  // Table module
  table: {
    operationMenu: {
      // Optional: Customize context menu
      insertColumnRight: { text: "Insert Column Right" },
      // Other operations...
    },
    backgroundColors: {
      colors: ["#4a90e2", "#999", "#ffffff", "#000000"],
      text: "Background Colors",
    },
    toolBarOptions: {
      dialogRows: 3, // Default: 9
      dialogColumns: 4, // Default: 9
      i18n: "en", // Dialog language
    },
  },

  // Code highlighting
  codeHighlight: true, // Or array of custom languages

  // Image module
  imageHandler: {
    imgUploadApi: async (formData) => {
      // Upload implementation
      return "https://example.com/image.jpg"; // Must return image URL
    },
    uploadSuccCB: (responseData) => {
      /* Success callback */
    },
    uploadFailCB: (error) => {
      /* Error callback */
    },
    imgRemarkPre: "Fig. ", // Caption prefix
    maxSize: 2, // Max image size in MB (Default: 5MB)
    imageAccept: "image/png, image/gif, image/jpeg, image/bmp, image/webp",
  },

  // Other modules
  imageResize: true, // Enable image resizing
  imageDrop: true, // Enable image drop/paste
  magicUrl: true, // Auto-detect URLs
  markdown: true, // Enable Markdown conversion
  link: true, // Enable link functionality

  // Toolbar customization
  toolbarOptions: [
    /* Custom toolbar configuration */
  ],
};
```

### Full Example

```jsx
import React, { useRef } from "react";
import RichTextEditor from "quill-react-pro";
import "quill-react-pro/lib/style.css";

function Editor() {
  const quillRef = useRef(null);

  const getQuill = (quillInstance) => {
    quillRef.current = quillInstance;
  };

  const handleChange = (delta, oldDelta) => {
    console.log("Editor content changed:", delta);
  };

  const handleSave = () => {
    console.log("Save requested (Ctrl+S)");
    // Implement save functionality
  };

  const modules = {
    table: {},
    codeHighlight: true,
    imageHandler: {
      imgUploadApi: async (formData) => {
        // In a real app, replace with actual upload implementation
        console.log("Uploading image...");
        return "https://example.com/image.jpg";
      },
      uploadFailCB: (error) => {
        console.error("Image upload failed:", error);
      },
    },
  };

  return (
    <RichTextEditor
      modules={modules}
      getQuill={getQuill}
      onChange={handleChange}
      onSave={handleSave}
      i18n="en"
      placeholder="Start writing..."
    />
  );
}

export default Editor;
```

## Customizing Code Highlighting

The editor uses `highlight.js` for syntax highlighting. You can switch themes:

```javascript
// Import your preferred highlight.js theme
import "highlight.js/styles/darcula.css";
```

Or via CDN:

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css"
/>
```

## Development & Contributing

Contributions to `quill-react-pro` are welcome!

**Local Development Setup:**

1. Clone this repository: `git clone https://github.com/marianochavez/quill-react-pro.git`
2. Install dependencies: `npm install`
3. Build the library: `npm run build`
4. Run the example: `npm run example`

This will build the library and serve an example page for testing.

## License

This project is licensed under the **ISC License**, the same license as the original `quill-react-commercial` project.

**Original Copyright:**
Copyright (c) 2017-2025, Lu Dejun. All rights reserved.

**Modifications Copyright:**
Modifications copyright (c) 2024-Present, Mariano Chavez (`amarianochavez@gmail.com`).

See the LICENSE file for full details.
