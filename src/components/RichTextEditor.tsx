// 'use client'

// import React from 'react'
// import {
//     Remirror,
//     ThemeProvider,
//     useRemirror,
//     EditorComponent,
// } from '@remirror/react'
// import {
//     Toolbar,
//     FormattingButtonGroup,
//     HistoryButtonGroup,
//     ToggleBoldButton,
//     ToggleItalicButton,
//     ToggleUnderlineButton,
//     UndoButton,
//     RedoButton,
// } from '@remirror/react-ui'
// import { BoldExtension } from '@remirror/extension-bold';

// export const RichTextEditor = () => {
//     //   const { manager, state } = useRemirror({
//     //     extensions: () => [
//     //       new BoldExtension(),
//     //       new ItalicExtension(),
//     //       new UnderlineExtension(),
//     //       new LinkExtension({ autoLink: true }),
//     //       new MarkdownExtension(),
//     //       new EmojiExtension(),
//     //     ],
//     //     content: '<p>Hello <b>Remirror</b>!</p>',
//     //     stringHandler: 'html',
//     //   });

//     // const { manager, state } = useRemirror({
//     //     extensions: () => [
//     //         // ... your extensions
//     //     ],
//     //     content: '<p>Start editing...</p>',
//     //     stringHandler: 'html',
//     // })

// //     const { manager, state } = useRemirror({
// //     extensions: () => [new BoldExtension({})],
// //     content: '<p>Hello</p>',
// //     stringHandler: 'html',
// //   });

// const { manager, state } = useRemirror({
//     extensions: () => [new BoldExtension({})], // ✅ Fix here
//     content: '<p>Hello <strong>world</strong></p>',
//     stringHandler: 'html',
//   });

//     return (
//         <ThemeProvider>
//             <Remirror manager={manager} initialContent={state}>
//                 <Toolbar>
//                     <FormattingButtonGroup>
//                         <ToggleBoldButton />
//                         <ToggleItalicButton />
//                         <ToggleUnderlineButton />
//                     </FormattingButtonGroup>
//                     <HistoryButtonGroup>
//                         <UndoButton />
//                         <RedoButton />
//                     </HistoryButtonGroup>
//                 </Toolbar>
//                 <EditorComponent />
//             </Remirror>
//         </ThemeProvider>
//     )
// }

// ************************* Working fine without image *****************************************

// 'use client'

// import React from 'react'
// import { useCallback, useState } from 'react';
// import type { RemirrorJSON } from 'remirror';
// import { OnChangeJSON } from '@remirror/react';
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

// const STORAGE_KEY = 'remirror-editor-content';

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void;
//     initialContent?: RemirrorJSON;
//   }

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent  }) => {
//     return (
//         <div style={{ padding: 16 }}>
//             <WysiwygEditor placeholder='Enter text...' initialContent={initialContent}>
//                 <OnChangeJSON onChange={onChange} />
//             </WysiwygEditor>
//         </div>
//     )
// }

// export const RichTextEditor = () => {

//     const [initialContent] = useState<RemirrorJSON | undefined>(() => {
//         // Retrieve the JSON from localStorage (or undefined if not found)
//         const content = window.localStorage.getItem(STORAGE_KEY);
//         return content ? JSON.parse(content) : undefined;
//       });

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         console.log('Content', json)
//         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
//       }, []);

//     return(
//         // <div style={{ padding: 16 }}>
//         //     <WysiwygEditor placeholder='Enter text...' />
//         // </div>
//         <TextEditor onChange={handleEditorChange} initialContent={initialContent}/>
//     )
// }

// *********************************** MarkDown **************************************
// not working

// 'use client'

// import React from 'react'
// import { useCallback, useState } from 'react';
// import type { RemirrorJSON } from 'remirror';
// import { OnChangeJSON } from '@remirror/react';
// // import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';
// import { MarkdownEditor } from '@remirror/react-editors/markdown';

// const STORAGE_KEY = 'remirror-editor-content';

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void;
//     initialContent?: RemirrorJSON;
//   }

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent  }) => {
//     return (
//         <div style={{ padding: 16 }}>
//             <MarkdownEditor placeholder='Enter text...' initialContent={initialContent}>
//                 <OnChangeJSON onChange={onChange} />
//             </MarkdownEditor>
//         </div>
//     )
// }

// export const RichTextEditor = () => {

//     const [initialContent] = useState<RemirrorJSON | undefined>(() => {
//         // Retrieve the JSON from localStorage (or undefined if not found)
//         const content = window.localStorage.getItem(STORAGE_KEY);
//         return content ? JSON.parse(content) : undefined;
//       });

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         console.log('Content', json)
//         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
//       }, []);

//     return(
//         // <div style={{ padding: 16 }}>
//         //     <WysiwygEditor placeholder='Enter text...' />
//         // </div>
//         <TextEditor onChange={handleEditorChange} initialContent={initialContent}/>
//     )
// }

//************************************************************************************

// 'use client'

// import React from 'react'
// import { useCallback, useState, useRef } from 'react';
// import type { RemirrorJSON } from 'remirror';
// import { OnChangeJSON, useRemirror } from '@remirror/react';
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';
// // import { ImageExtension } from '@remirror/extension-image';
// import {
//     BoldExtension,
//     ItalicExtension,
//     HardBreakExtension,
//     ImageExtension,
//   } from 'remirror/extensions';
//   import {
//     // useRemirror,
//     // ComponentItem,
//     Remirror,
//     useCommands,
//     useHelpers,
//     useActive,
//     useKeymap,
//   } from '@remirror/react';

// const STORAGE_KEY = 'remirror-editor-content';

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void;
//     initialContent?: RemirrorJSON;
// }

// // const uploadToMockServer = async (file: File): Promise<string> => {
// // // Replace this with your actual upload logic (e.g., Cloudinary or S3)
// //     return new Promise((resolve) => {
// //         setTimeout(() => {
// //         const mockUrl = URL.createObjectURL(file); // local blob for demo
// //         resolve(mockUrl);
// //         }, 1000);
// //     });
// // };

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent  }) => {

//     // const { manager, state, getContext } = useRemirror({
//     //     extensions: () => [
//     //         new BoldExtension({}),
//     //         new ItalicExtension(),
//     //         new HardBreakExtension(),
//     //         new ImageExtension({ enableResizing: true }),
//     //     ],
//     //     content: initialContent,
//     //     // stringHandler: 'json',
//     // });

//     // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     //     const file = event.target.files?.[0];
//     //     if (!file) return;

//     // const imageUrl = await uploadToMockServer(file);
//     //     if (imageUrl) {
//     //       const ctx = getContext();
//     //       ctx && ctx.commands.insertImage({ src: imageUrl });
//     //     }
//     // };

//     return (
//         <div style={{ padding: 16 }}>
//     {/* <div style={{ marginBottom: 8 }}>
//       <label
//         htmlFor="image-upload"
//         style={{
//           padding: '6px 12px',
//           background: '#6c63ff',
//           color: 'white',
//           borderRadius: 4,
//           cursor: 'pointer',
//           display: 'inline-block'
//         }}
//       >
//         Upload Image
//       </label>
//       <input
//         id="image-upload"
//         type="file"
//         accept="image/*"
//         onChange={handleImageUpload}
//         style={{ display: 'none' }}
//       />
//     </div> */}
//             <WysiwygEditor placeholder='Enter text...' initialContent={initialContent}>
//                 <OnChangeJSON onChange={onChange} />
//             </WysiwygEditor>
//         </div>
//     )
// }

// export const RichTextEditor = () => {

//     const inputRef = useRef(null);
//     const { insertImage } = useCommands();
//     const [initialContent] = useState<RemirrorJSON | undefined>(() => {
//         // Retrieve the JSON from localStorage (or undefined if not found)
//         const content = window.localStorage.getItem(STORAGE_KEY);
//         return content ? JSON.parse(content) : undefined;
//       });

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         console.log('Content', json)
//         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
//       }, []);

//       const handleFileChange = (event:any) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         // Create a local URL for the file
//         const imageUrl = URL.createObjectURL(file);

//         // In a real application, you would upload the file to your server here
//         // const formData = new FormData();
//         // formData.append('file', file);
//         // const response = await fetch('/api/upload', { method: 'POST', body: formData });
//         // const { url } = await response.json();

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name });

//         // Clear the input
//         if (inputRef.current) {
//           inputRef.current.value = '';
//         }
//       };

//     return(
//         <div>
//              <div>
//       <button
//         onClick={() => inputRef.current?.click()}
//         className="remirror-button"
//       >
//         Upload Image
//       </button>
//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         onChange={handleFileChange}
//         style={{ display: 'none' }}
//       />
//     </div>
//     <TextEditor onChange={handleEditorChange} initialContent={initialContent}/>

//         </div>
//     )
// }

// ****************** Working with Image but rest are not working that gracefully ***************

// import React, { useCallback, useRef } from 'react'
// import {
//     useRemirror,
//     //   ComponentItem,
//     Remirror,
//     useCommands,
//     useHelpers,
//     useActive,
//     useKeymap,
// } from '@remirror/react'
// import {
//     BoldExtension,
//     ItalicExtension,
//     UnderlineExtension,
//     ImageExtension,
//     DropCursorExtension,
// } from 'remirror/extensions'
// import { FileUploader } from './FileUploader'

// // Create a custom upload button component
// const UploadButton = () => {
//     const inputRef = useRef<HTMLInputElement>(null)
//     const { insertImage } = useCommands()

//     const handleFileChange = (event: any) => {
//         const file = event.target.files[0]
//         if (!file) return

//         // Create a local URL for the file
//         const imageUrl = URL.createObjectURL(file)

//         console.log('imageUrl', imageUrl)

//         // In a real application, you would upload the file to your server here
//         // const formData = new FormData();
//         // formData.append('file', file);
//         // const response = await fetch('/api/upload', { method: 'POST', body: formData });
//         // const { url } = await response.json();

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Clear the input
//         if (inputRef.current) {
//             inputRef.current.value = ''
//             //no
//         }
//     }

//     return (
//         <div>
//             <button
//                 onClick={() => inputRef.current?.click()}
//                 className="remirror-button"
//             >
//                 Upload Image
//             </button>
//             <input
//                 ref={inputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 style={{ display: 'none' }}
//             />
//         </div>
//     )
// }

// // Custom FileUploader component (placeholder - implement as needed)
// const FileUploaderComponent = () => {
//     const { insertImage } = useCommands()

//     const handleFileUpload = useCallback(
//         (file: any) => {
//             // Process the file and return a URL (could be from server)
//             const imageUrl = URL.createObjectURL(file)
//             insertImage({ src: imageUrl, alt: file.name })
//         },
//         [insertImage]
//     )

//     return <FileUploader onUpload={handleFileUpload} />
// }

// // Main Editor Component
// const Editor = () => {
//     // Define the extensions to use
//     const extensions = () => [
//         new BoldExtension({}),
//         new ItalicExtension(),
//         new UnderlineExtension(),
//         new ImageExtension({
//             enableResizing: true,
//         }),
//         // new DropCursorExtension(),
//     ]

//     // Set up the editor
//     const { manager, state } = useRemirror({
//         extensions,
//         content: '<p>Try uploading an image!</p>',
//         selection: 'end',
//         stringHandler: 'html',
//     })

//     return (
//         <Remirror
//             manager={manager}
//             initialContent={state}
//             autoFocus
//             autoRender="end"
//         >
//             <EditorToolbar />
//             <div style={{ padding: '1rem' }}>
//                 {/* Editor content appears here */}
//             </div>
//         </Remirror>
//     )
// }

// // Toolbar with the upload button
// const EditorToolbar = () => {
//     const { toggleBold, toggleItalic, toggleUnderline } = useCommands()
//     const active = useActive()

//     return (
//         <div style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
//             <button
//                 onClick={() => toggleBold()}
//                 className={`remirror-button ${active.bold() ? 'active' : ''}`}
//             >
//                 Bold
//             </button>
//             <button
//                 onClick={() => toggleItalic()}
//                 className={`remirror-button ${active.italic() ? 'active' : ''}`}
//             >
//                 Italic
//             </button>
//             <button
//                 onClick={() => toggleUnderline()}
//                 className={`remirror-button ${
//                     active.underline() ? 'active' : ''
//                 }`}
//             >
//                 Underline
//             </button>
//             <UploadButton />
//         </div>
//     )
// }

// // For drag and drop support
// const FileDragAndDrop = () => {
//     const { insertImage } = useCommands()

//     const handleDrop = useCallback(
//         (event: any) => {
//             event.preventDefault()
//             const files = event.dataTransfer.files

//             if (files.length > 0) {
//                 Array.from(files).forEach((file: any) => {
//                     if (file.type.startsWith('image/')) {
//                         const imageUrl = URL.createObjectURL(file)
//                         insertImage({ src: imageUrl, alt: file.name })
//                     }
//                 })
//             }
//         },
//         [insertImage]
//     )

//     return (
//         <div
//             onDrop={handleDrop}
//             onDragOver={(e) => e.preventDefault()}
//             style={{
//                 minHeight: '200px',
//                 border: '2px dashed #ccc',
//                 padding: '1rem',
//             }}
//         >
//             Drag and drop images here
//         </div>
//     )
// }

// // Example of a complete application
// const RichTextEditor = () => {
//     return (
//         <div className="remirror-theme">
//             <h1>Remirror Editor with File Upload</h1>
//             <Editor />
//         </div>
//     )
// }

// export default RichTextEditor

// ************************************************************************************

// 'use client'

// import React from 'react'
// import { useCallback, useState } from 'react';
// import type { RemirrorJSON } from 'remirror';
// import { OnChangeJSON } from '@remirror/react';
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

// const STORAGE_KEY = 'remirror-editor-content';

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void;
//     initialContent?: RemirrorJSON;
//   }

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent  }) => {
//     return (
//         <div style={{ padding: 16 }}>
//             <WysiwygEditor placeholder='Enter text...' initialContent={initialContent}>
//                 <OnChangeJSON onChange={onChange} />
//             </WysiwygEditor>
//         </div>
//     )
// }

// export const RichTextEditor = () => {

//     const [initialContent] = useState<RemirrorJSON | undefined>(() => {
//         // Retrieve the JSON from localStorage (or undefined if not found)
//         const content = window.localStorage.getItem(STORAGE_KEY);
//         return content ? JSON.parse(content) : undefined;
//       });

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         console.log('Content', json)
//         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
//       }, []);

//     return(
//         // <div style={{ padding: 16 }}>
//         //     <WysiwygEditor placeholder='Enter text...' />
//         // </div>
//         <TextEditor onChange={handleEditorChange} initialContent={initialContent}/>
//     )
// }

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// import React, { useCallback, useState, useRef } from 'react'
// import {
//     useRemirror,
//     //   ComponentItem,
//     Remirror,
//     useCommands,
//     useHelpers,
//     useActive,
//     useKeymap,
// } from '@remirror/react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import {
//     BoldExtension,
//     ItalicExtension,
//     UnderlineExtension,
//     ImageExtension,
//     DropCursorExtension,
// } from 'remirror/extensions'
// import { FileUploader } from './FileUploader'

// const STORAGE_KEY = 'remirror-editor-content'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom upload button component
// const UploadButton = () => {
//     const inputRef = useRef<HTMLInputElement>(null)
//     const { insertImage } = useCommands()

//     const handleFileChange = (event: any) => {
//         const file = event.target.files[0]
//         if (!file) return

//         // Create a local URL for the file
//         const imageUrl = URL.createObjectURL(file)

//         // In a real application, you would upload the file to your server here
//         // const formData = new FormData();
//         // formData.append('file', file);
//         // const response = await fetch('/api/upload', { method: 'POST', body: formData });
//         // const { url } = await response.json();

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Clear the input
//         if (inputRef.current) {
//             inputRef.current.value = ''
//             //no
//         }
//     }

//     return (
//         <div>
//             <button
//                 onClick={() => inputRef.current?.click()}
//                 className="remirror-button"
//             >
//                 Upload Image
//             </button>
//             <input
//                 ref={inputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 style={{ display: 'none' }}
//             />
//         </div>
//     )
// }

// // Custom FileUploader component (placeholder - implement as needed)
// const FileUploaderComponent = () => {
//     const { insertImage } = useCommands()

//     const handleFileUpload = useCallback(
//         (file: any) => {
//             // Process the file and return a URL (could be from server)
//             const imageUrl = URL.createObjectURL(file)
//             insertImage({ src: imageUrl, alt: file.name })
//         },
//         [insertImage]
//     )

//     return <FileUploader onUpload={handleFileUpload} />
// }

// // Main Editor Component
// // const Editor: React.FC<MyEditorProps> = ({ onChange, initialContent  }) => {
// const Editor = () => {
//     // Define the extensions to use
//     const extensions = () => [
//         new BoldExtension({}),
//         new ItalicExtension(),
//         new UnderlineExtension(),
//         new ImageExtension({
//             enableResizing: true,
//         }),
//         // new DropCursorExtension(),
//     ]

//     // Set up the editor
//     const { manager, state } = useRemirror({
//         extensions,
//         content: '<p>Try uploading an image!</p>',
//         selection: 'end',
//         stringHandler: 'html',
//     })

//     const [initialContent] = useState<RemirrorJSON | undefined>(() => {
//         // Retrieve the JSON from localStorage (or undefined if not found)
//         const content = window.localStorage.getItem(STORAGE_KEY)
//         return content ? JSON.parse(content) : undefined
//     })

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         console.log('Content', json)
//         window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
//     }, [])

//     return (
//         <>
//             <Remirror
//                 manager={manager}
//                 //   initialContent={state}
//                 autoFocus
//                 autoRender="end"
//             >
//                 <EditorToolbar />
//                 {/* <div style={{ padding: '1rem' }}>
//                     Editor content appears here
//                 </div> */}

//                 <div style={{ padding: 16 }}>
//                     <WysiwygEditor
//                         placeholder="Enter text..."
//                         initialContent={initialContent}
//                     >
//                         <OnChangeJSON onChange={handleEditorChange} />
//                     </WysiwygEditor>
//                 </div>
//             </Remirror>
//         </>
//     )
// }

// // Toolbar with the upload button
// const EditorToolbar = () => {
//     const { toggleBold, toggleItalic, toggleUnderline } = useCommands()
//     const active = useActive()

//     return (
//         <div style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
//             <button
//                 onClick={() => toggleBold()}
//                 className={`remirror-button ${active.bold() ? 'active' : ''}`}
//             >
//                 Bold
//             </button>
//             <button
//                 onClick={() => toggleItalic()}
//                 className={`remirror-button ${active.italic() ? 'active' : ''}`}
//             >
//                 Italic
//             </button>
//             <button
//                 onClick={() => toggleUnderline()}
//                 className={`remirror-button ${
//                     active.underline() ? 'active' : ''
//                 }`}
//             >
//                 Underline
//             </button>
//             <UploadButton />
//         </div>
//     )
// }

// // For drag and drop support
// // const FileDragAndDrop = () => {
// //   const { insertImage } = useCommands();

// //   const handleDrop = useCallback((event:any) => {
// //     event.preventDefault();
// //     const files = event.dataTransfer.files;

// //     if (files.length > 0) {
// //       Array.from(files).forEach((file:any) => {
// //         if (file.type.startsWith('image/')) {
// //           const imageUrl = URL.createObjectURL(file);
// //           insertImage({ src: imageUrl, alt: file.name });
// //         }
// //       });
// //     }
// //   }, [insertImage]);

// //   return (
// //     <div
// //       onDrop={handleDrop}
// //       onDragOver={(e) => e.preventDefault()}
// //       style={{ minHeight: '200px', border: '2px dashed #ccc', padding: '1rem' }}
// //     >
// //       Drag and drop images here
// //     </div>
// //   );
// // };

// // Example of a complete application
// const RichTextEditor = () => {
//     return (
//         <div className="remirror-theme">
//             <h1>Remirror Editor with File Upload</h1>
//             <Editor />
//         </div>
//     )
// }

// export default RichTextEditor

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// ***************** Working perfectly but after refreshing the page, image gets disapeared ************

'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import type { RemirrorJSON } from 'remirror'
import { OnChangeJSON } from '@remirror/react'
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
import {
    useCommands,
    // ComponentItem,
    useActive,
    useAttrs,
    // FloatingToolbar,
} from '@remirror/react'
// import { FloatingToolbar } from '@remirror/react-editors/wysiwyg'
import { Image, Upload, Camera } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
// import { MenuBar } from '@remirror/react';

const STORAGE_KEY = 'remirror-editor-content'

interface MyEditorProps {
    onChange: (json: RemirrorJSON) => void
    initialContent?: RemirrorJSON
}

// Create a custom toolbar button for image uploads
const ImageUploadButton = () => {
    const { insertImage } = useCommands()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Create a URL for the uploaded image
        const imageUrl = URL.createObjectURL(file)

        // Insert the image into the editor
        insertImage({ src: imageUrl, alt: file.name })

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex items-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
            />
            <label
                htmlFor="image-upload"
                className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            >
                <Camera size={18} className="text-gray-600" />
                <span className="ml-2">Upload Image</span>
            </label>
        </div>
    )
}

const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent }) => {
    // Custom extension that adds our image upload button to the toolbar
    // const customExtensions = [
    //     () => ({
    //         name: 'image-upload-button',
    //         renderToolbar: () => (
    //             // <ComponentItem>
    //             <ImageUploadButton />
    //             // </ComponentItem>
    //         ),
    //     }),
    // ]

    const [editorKey, setEditorKey] = useState(0)

    // Force editor to re-render when initialContent changes
    useEffect(() => {
        if (initialContent) {
            setEditorKey((prevKey) => prevKey + 1)
        }
    }, [initialContent])

    console.log('initialContent in TextEditor', initialContent)

    const customExtensions = [
        () => ({
            name: 'custom-toolbar',
            addToolbarButtons: () => [
                {
                    id: 'image-upload',
                    component: ImageUploadButton,
                    active: () => false,
                    enabled: () => true,
                },
            ],
        }),
    ]

    // useEffect(() => {
    //     console.log('initialContent in TextEditor in UseEffect', initialContent)
    // }, [initialContent])
    return (
        // <WysiwygEditor
        //   initialContent={initialContent}
        //   onChange={onChange}
        //   extensions={customExtensions}
        //   placeholder="Start typing..."
        //   className="p-4 border rounded-md min-h-[300px]"
        // />
        <WysiwygEditor
            key={editorKey}
            placeholder="Start typing..."
            initialContent={initialContent}
            // extensions={customExtensions}
            // className="p-4 border rounded-md"
        >
            {/* <ImageUploadButton /> */}
            {/* <div className="sticky top-0 z-10 bg-white pb-2">
                <ImageUploadButton />
            </div> */}
            {/* <div className="bg-gray-50 border-b p-2 flex items-center">
                <ImageUploadButton />
            </div> */}
            {/* <MenuBar>
                <ImageUploadButton />
            </MenuBar> */}
            <div className="bg-gray-50 border-b p-2 flex items-center">
                <div className="mr-4">
                    <ImageUploadButton />
                </div>
                {/* You can add more toolbar buttons here */}
            </div>
            <OnChangeJSON onChange={onChange} />

            {/* <FloatingToolbar>
                <ImageUploadButton />
            </FloatingToolbar> */}
        </WysiwygEditor>
    )
}

export const RichTextEditor = ({
    initialContent,
    setInitialContent,
}: {
    initialContent: any
    setInitialContent: (content: any) => void
}) => {
    // const [initialContent] = useState()
    // const [initialContent] = useState(() => {
    //     if (typeof window !== 'undefined') {
    //         // Retrieve the JSON from localStorage (or undefined if not found)
    //         const content = window.localStorage.getItem(STORAGE_KEY)
    //         return content ? JSON.parse(content) : undefined
    //     }
    //     return undefined
    // })

    const handleEditorChange = useCallback((json: RemirrorJSON) => {
        // Store the JSON in localstorage
        console.log('Content', json)
        setInitialContent(json)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
    }, [])

    useEffect(() => {
        console.log('initialContent in editor', initialContent)
    }, [initialContent])

    return (
        <div className="w-full">
            <ScrollArea
                // className={`${heightClass} pr-4`}

                className="h-96 pr-8 "
                type="hover"
                style={{
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                }}
            >
                <TextEditor
                    onChange={handleEditorChange}
                    initialContent={initialContent}
                />
            </ScrollArea>
        </div>
    )
}

// *********************************************************************************************
