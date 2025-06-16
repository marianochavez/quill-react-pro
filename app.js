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
        const App = function App() {
            const quill = React.useRef({});
            const [delta, setDelta] = React.useState('');
            const initContent = '';

            const getQuill = function (quillIns) {
                quill.current = quillIns;
            };

            const quillChange = function (delta, old, source) {
                setDelta(JSON.stringify(quill.current.getContents()));
            };

            const RichTextEditor = window.QuillReactPro;

            return React.createElement(
                "div",
                { className: "App" },
                React.createElement(RichTextEditor, {
                    i18n: 'en',
                    readOnly: false,
                    modules: {
                        table: {},
                        codeHighlight: true,
                        imageHandler: {
                            imgUploadApi: function (formData) {
                                // This would need to be implemented properly
                                console.log('Image upload requested');
                                return Promise.resolve('https://example.com/image.jpg');
                            },
                            uploadFailCB: function () {
                                console.error('Image upload fail!');
                            }
                        }
                    },
                    getQuill: getQuill,
                    content: initContent,
                    onChange: quillChange,
                    onFocus: function (arg) { },
                    onSave: function () { console.log("'CMD+S' used."); }
                }),
                React.createElement(
                    "div",
                    { style: { height: 200 } },
                    delta
                )
            );
        };

        const domContainer = document.querySelector('#root');

        // Check if we are using React 18 (which uses createRoot) or previous versions
        if (ReactDOM.createRoot) {
            // React 18+
            try {
                const root = ReactDOM.createRoot(domContainer);
                root.render(React.createElement(App, null));
                console.log('App rendered with React 18+ createRoot');
            } catch (e) {
                reportError('Error rendering with createRoot: ' + e.message);
            }
        } else {
            // React 18-
            try {
                ReactDOM.render(React.createElement(App, null), domContainer);
                console.log('App rendered with ReactDOM.render (React < 18)');
            } catch (e) {
                reportError('Error rendering with ReactDOM.render: ' + e.message);
            }
        }
    } catch (e) {
        reportError('Error in application initialization: ' + e.message);
    }
} 