"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
require("core-js/modules/es.date.to-json.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
// Browser-compatible script without imports
function reportError(message) {
  try {
    console.error(message);
    var errorInfo = document.getElementById('error-info');
    if (errorInfo) {
      errorInfo.textContent += 'APP ERROR: ' + message + '\n';
    }
  } catch (e) {
    console.error('Error reporting error:', e);
  }
}

// Check if React is available
if (!window.React) {
  reportError('React is not available');
} else if (!window.ReactDOM) {
  reportError('ReactDOM is not available');
} else if (!window.QuillReactPro) {
  reportError('QuillReactPro is not available');
} else {
  try {
    var App = function App() {
      var quill = React.useRef({});
      var _React$useState = React.useState(''),
        _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
        delta = _React$useState2[0],
        setDelta = _React$useState2[1];
      var initContent = '';
      var getQuill = function getQuill(quillIns) {
        quill.current = quillIns;
      };
      var quillChange = function quillChange(delta, old, source) {
        setDelta(JSON.stringify(quill.current.getContents()));
      };
      var RichTextEditor = window.QuillReactPro;
      return React.createElement("div", {
        className: "App"
      }, React.createElement(RichTextEditor, {
        i18n: 'en',
        readOnly: true,
        modules: {
          table: {},
          codeHighlight: true,
          imageHandler: {
            imgUploadApi: function imgUploadApi(formData) {
              // This would need to be implemented properly
              console.log('Image upload requested');
              return Promise.resolve('https://example.com/image.jpg');
            },
            uploadFailCB: function uploadFailCB() {
              console.error('Image upload fail!');
            }
          }
        },
        getQuill: getQuill,
        content: initContent,
        onChange: quillChange,
        onFocus: function onFocus(arg) {},
        onSave: function onSave() {
          console.log("'CMD+S' used.");
        }
      }), React.createElement("div", {
        style: {
          height: 200
        }
      }, delta));
    };
    var domContainer = document.querySelector('#root');

    // Check if we are using React 18 (which uses createRoot) or previous versions
    if (ReactDOM.createRoot) {
      // React 18+
      try {
        var root = ReactDOM.createRoot(domContainer);
        root.render(React.createElement(App, null));
        reportError('App rendered with React 18+ createRoot');
      } catch (e) {
        reportError('Error rendering with createRoot: ' + e.message);
      }
    } else {
      // React 18-
      try {
        ReactDOM.render(React.createElement(App, null), domContainer);
        reportError('App rendered with ReactDOM.render (React < 18)');
      } catch (e) {
        reportError('Error rendering with ReactDOM.render: ' + e.message);
      }
    }
  } catch (e) {
    reportError('Error in application initialization: ' + e.message);
  }
}