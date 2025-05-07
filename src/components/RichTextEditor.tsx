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
// const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: any
//     setInitialContent: (content: any) => void
// }) => {
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

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { useCommands } from '@remirror/react'
// import { Camera } from 'lucide-react'
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent }) => {
//     const [editorKey, setEditorKey] = useState(0)

//     // Force editor to re-render when initialContent changes
//     useEffect(() => {
//         if (initialContent) {
//             setEditorKey((prevKey) => prevKey + 1)
//         }
//     }, [initialContent])

//     return (
//         <WysiwygEditor
//             key={editorKey}
//             placeholder="Start typing..."
//             initialContent={initialContent}
//         >
//             <div className="sticky top-0 z-10 bg-white pb-2">
//                 <ImageUploadButton />
//             </div>
//             <OnChangeJSON onChange={onChange} />
//         </WysiwygEditor>
//     )
// }

// export const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: any
//     setInitialContent: (content: any) => void
// }) => {
//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         setInitialContent(json)
//     }, [])

//     useEffect(() => {
//         console.log('initialContent in editor', initialContent)
//     }, [initialContent])

//     return (
//         <div className="w-full">
//             <ScrollArea
//                 className="h-96 pr-8 "
//                 type="hover"
//                 style={{
//                     scrollbarWidth: 'none', // Firefox
//                     msOverflowStyle: 'none', // IE and Edge
//                 }}
//             >
//                 <TextEditor
//                     onChange={handleEditorChange}
//                     initialContent={initialContent}
//                 />
//             </ScrollArea>
//         </div>
//     )
// }

// *********************************************************************************************

// ********************************* Copy of final draft ***************************************

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import {
//     useCommands,
//     // ComponentItem,
//     useActive,
//     useAttrs,
//     // FloatingToolbar,
// } from '@remirror/react'
// // import { FloatingToolbar } from '@remirror/react-editors/wysiwyg'
// import { Image, Upload, Camera } from 'lucide-react'
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
// // import { MenuBar } from '@remirror/react';

// const STORAGE_KEY = 'remirror-editor-content'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// const EditorToolbar = () => {
//     const {
//         toggleBold,
//         toggleItalic,
//         toggleUnderline,
//         toggleHeading,
//         toggleCode,
//         toggleBlockquote,
//         toggleBulletList,
//         toggleOrderedList,
//     } = useCommands()
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
//             <button onClick={() => toggleHeading({ level: 1 })}>H1</button>
//             <button onClick={() => toggleHeading({ level: 2 })}>H2</button>
//             <button onClick={() => toggleHeading({ level: 3 })}>H3</button>
//             <button
//                 onClick={() => toggleCode()}
//                 className={`remirror-button ${active.code() ? 'active' : ''}`}
//             >
//                 Code
//             </button>
//             <button
//                 onClick={() => toggleBlockquote()}
//                 className={`remirror-button ${active.italic() ? 'active' : ''}`}
//             >
//                 Block quote
//             </button>
//             <button
//                 onClick={() => toggleBulletList()}
//                 className={`remirror-button ${active.italic() ? 'active' : ''}`}
//             >
//                 Bullet List
//             </button>
//             <button
//                 onClick={() => toggleOrderedList()}
//                 className={`remirror-button ${active.italic() ? 'active' : ''}`}
//             >
//                 Ordered List
//             </button>
//             {/* <UploadButton /> */}
//         </div>
//     )
// }

// const TextEditor: React.FC<MyEditorProps> = ({ onChange, initialContent }) => {
//     const [editorKey, setEditorKey] = useState(0)

//     // Force editor to re-render when initialContent changes
//     useEffect(() => {
//         if (initialContent) {
//             setEditorKey((prevKey) => prevKey + 1)
//         }
//     }, [initialContent])

//     // const customExtensions = [
//     //     () => ({
//     //         name: 'custom-toolbar',
//     //         addToolbarButtons: () => [
//     //             {
//     //                 id: 'image-upload',
//     //                 component: ImageUploadButton,
//     //                 active: () => false,
//     //                 enabled: () => true,
//     //             },
//     //         ],
//     //     }),
//     // ]

//     return (
//         <WysiwygEditor
//             key={editorKey}
//             placeholder="Start typing..."
//             initialContent={initialContent}
//             // extensions={customExtensions}
//             // className="p-4 border rounded-md"
//         >
//             <EditorToolbar />
//             <div className="sticky top-0 z-10 bg-white pb-2">
//                 <ImageUploadButton />
//             </div>
//             <OnChangeJSON onChange={onChange} />

//             {/* <FloatingToolbar>
//                 <ImageUploadButton />
//             </FloatingToolbar> */}
//         </WysiwygEditor>
//     )
// }

// export const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: any
//     setInitialContent: (content: any) => void
// }) => {
//     // const [initialContent] = useState()
//     // const [initialContent] = useState(() => {
//     //     if (typeof window !== 'undefined') {
//     //         // Retrieve the JSON from localStorage (or undefined if not found)
//     //         const content = window.localStorage.getItem(STORAGE_KEY)
//     //         return content ? JSON.parse(content) : undefined
//     //     }
//     //     return undefined
//     // })

//     const handleEditorChange = useCallback((json: RemirrorJSON) => {
//         // Store the JSON in localstorage
//         // console.log('Content', json)
//         setInitialContent(json)
//         // window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
//     }, [])

//     useEffect(() => {
//         console.log('initialContent in editor', initialContent)
//     }, [initialContent])

//     return (
//         <div className="w-full">
//             <ScrollArea
//                 className="h-96 pr-8 "
//                 type="hover"
//                 style={{
//                     scrollbarWidth: 'none', // Firefox
//                     msOverflowStyle: 'none', // IE and Edge
//                 }}
//             >
//                 <TextEditor
//                     onChange={handleEditorChange}
//                     initialContent={initialContent}
//                 />
//             </ScrollArea>
//         </div>
//     )
// }

// ****************** Working with Image but rest are not working that gracefully ***************
// Draft 2

// import React, { useCallback, useEffect, useRef } from 'react'
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
// // const FileUploaderComponent = () => {
// //     const { insertImage } = useCommands()

// //     const handleFileUpload = useCallback(
// //         (file: any) => {
// //             // Process the file and return a URL (could be from server)
// //             const imageUrl = URL.createObjectURL(file)
// //             insertImage({ src: imageUrl, alt: file.name })
// //         },
// //         [insertImage]
// //     )

// //     return <FileUploader onUpload={handleFileUpload} />
// // }

// // Main Editor Component
// // const Editor = () => {
// //     // Define the extensions to use
// //     const extensions = () => [
// //         new BoldExtension({}),
// //         new ItalicExtension(),
// //         new UnderlineExtension(),
// //         new ImageExtension({
// //             enableResizing: true,
// //         }),
// //         // new DropCursorExtension(),
// //     ]

// //     // Set up the editor
// //     const { manager, state } = useRemirror({
// //         extensions,
// //         content: '<p>Try uploading an image!</p>',
// //         selection: 'end',
// //         stringHandler: 'html',
// //     })

// //     return (
// //         <Remirror
// //             manager={manager}
// //             initialContent={state}
// //             autoFocus
// //             autoRender="end"
// //         >
// //             <EditorToolbar />
// //             <div style={{ padding: '1rem' }}>
// //                 {/* Editor content appears here */}
// //             </div>
// //         </Remirror>
// //     )
// // }

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
// //     const { insertImage } = useCommands()

// //     const handleDrop = useCallback(
// //         (event: any) => {
// //             event.preventDefault()
// //             const files = event.dataTransfer.files

// //             if (files.length > 0) {
// //                 Array.from(files).forEach((file: any) => {
// //                     if (file.type.startsWith('image/')) {
// //                         const imageUrl = URL.createObjectURL(file)
// //                         insertImage({ src: imageUrl, alt: file.name })
// //                     }
// //                 })
// //             }
// //         },
// //         [insertImage]
// //     )

// //     return (
// //         <div
// //             onDrop={handleDrop}
// //             onDragOver={(e) => e.preventDefault()}
// //             style={{
// //                 minHeight: '200px',
// //                 border: '2px dashed #ccc',
// //                 padding: '1rem',
// //             }}
// //         >
// //             Drag and drop images here
// //         </div>
// //     )
// // }

// // Example of a complete application
// const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: any
//     setInitialContent: (content: any) => void
// }) => {
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

//     useEffect(() => {
//         setInitialContent(state)
//     }, [state])

//     console.log('initialContent', initialContent)
//     console.log('state', state)

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
//     // return (
//     //     <div className="remirror-theme">
//     //         <h1>Remirror Editor with File Upload</h1>
//     //         <Editor />
//     //     </div>
//     // )
// }

// export default RichTextEditor

// %%%%%%%%%%%%%%%%%%%%%%%% The last try - Became the final one %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { useCommands } from '@remirror/react'
// import { Camera } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// export const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     return (
//         <ScrollArea
//             className="h-96 pr-8 "
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             <WysiwygEditor
//                 key={editorKey}
//                 placeholder="Start typing..."
//                 initialContent={initialContent || undefined}
//             >
//                 <div className="sticky top-0 z-10 bg-white pb-2">
//                     <ImageUploadButton />
//                 </div>
//                 <OnChangeJSON onChange={handleEditorChange} />
//             </WysiwygEditor>
//         </ScrollArea>
//     )
// }

// %%%%%%%%%%%% Trying alternative for final %%%%%%%%%%%%%%%%%%%%%%%%%%%

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import {
//     WysiwygEditor,
//     WysiwygEditorProps,
// } from '@remirror/react-editors/wysiwyg'
// import { useCommands } from '@remirror/react'
// import { Camera } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// export const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     // Define custom editor props with extension options to disable specific features
//     // const customEditorProps: Partial<WysiwygEditorProps> = {
//     //     // Use the 'extensionDecorators' or 'extensions' prop to customize the toolbar
//     //     editorOptions: {
//     //         exclude: [
//     //             'bold', // Disable bold
//     //             'italic', // Disable italic
//     //             'strike', // Disable strikethrough
//     //             'bulletList', // Disable bullet lists
//     //             'orderedList', // Disable ordered lists
//     //             'heading', // Disable all headings
//     //             'blockquote', // Disable blockquotes
//     //             'codeBlock', // Disable code blocks
//     //             // Add more to exclude as needed
//     //         ],
//     //     },
//     //     // You can keep what you want to show:
//     //     toolbarItems: ['toggleUnderline', 'undo', 'redo'],
//     //     // Hide unused toolbar sections
//     //     disableToolbarItems: {
//     //         heading: true,
//     //         formatting: true, // This should hide bold, italic, etc.
//     //         list: true,
//     //         alignment: true,
//     //         indentation: true,
//     //         history: false, // Keep undo/redo
//     //     },
//     // }

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             <WysiwygEditor
//                 key={editorKey}
//                 placeholder="Start typing..."
//                 initialContent={initialContent || undefined}
//                 // {...customEditorProps}
//             >
//                 <div className="sticky top-0 z-10 bg-white pb-2">
//                     <ImageUploadButton />
//                 </div>
//                 <OnChangeJSON onChange={handleEditorChange} />
//             </WysiwygEditor>
//         </ScrollArea>
//     )
// }

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { useCommands } from '@remirror/react'
// import { Camera } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// // Custom CSS to hide specific toolbar buttons
// const hideToolbarButtonsStyle = `
//   /* Hide specific toolbar buttons using CSS selectors */
//   /* You may need to inspect the actual elements in your browser to get the exact selectors */

//   /* Hide Bold button */
//   .remirror-toolbar-button[data-name="bold"],
//   .remirror-editor-wrapper button[aria-label="Bold"] {
//     display: none !important;
//   }

//   /* Hide Italic button */
//   .remirror-toolbar-button[data-name="italic"],
//   .remirror-editor-wrapper button[aria-label="Italic"] {
//     display: none !important;
//   }

//   /* Hide Heading buttons */
//   .remirror-toolbar-button[data-name="heading1"],
//   .remirror-toolbar-button[data-name="heading2"],
//   .remirror-toolbar-button[data-name="heading3"],
//   .remirror-editor-wrapper button[aria-label="Heading 1"],
//   .remirror-editor-wrapper button[aria-label="Heading 2"],
//   .remirror-editor-wrapper button[aria-label="Heading 3"] {
//     display: none !important;
//   }

//   /* Hide List buttons */
//   .remirror-toolbar-button[data-name="bulletList"],
//   .remirror-toolbar-button[data-name="orderedList"],
//   .remirror-editor-wrapper button[aria-label="Bullet List"],
//   .remirror-editor-wrapper button[aria-label="Ordered List"] {
//     display: none !important;
//   }

//   /* Keep only Underline, Undo and Redo */
//   .remirror-toolbar-button:not([data-name="underline"]):not([data-name="undo"]):not([data-name="redo"]),
//   .remirror-editor-wrapper button:not([aria-label="Underline"]):not([aria-label="Undo"]):not([aria-label="Redo"]) {
//     display: none !important;
//   }
// `

// export const RichTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     return (
//         <>
//             {/* Inject custom CSS to hide toolbar buttons */}
//             <style jsx global>
//                 {hideToolbarButtonsStyle}
//             </style>

//             <ScrollArea
//                 className="h-96 pr-8"
//                 type="hover"
//                 style={{
//                     scrollbarWidth: 'none', // Firefox
//                     msOverflowStyle: 'none', // IE and Edge
//                 }}
//             >
//                 <WysiwygEditor
//                     key={editorKey}
//                     placeholder="Start typing..."
//                     initialContent={initialContent || undefined}
//                 >
//                     <div className="sticky top-0 z-10 bg-white pb-2">
//                         <ImageUploadButton />
//                     </div>
//                     <OnChangeJSON onChange={handleEditorChange} />
//                 </WysiwygEditor>
//             </ScrollArea>
//         </>
//     )
// }

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% With code and Quotes %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// // Keep the original import that worked in your code
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// export const RemirrorTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     // Reference to file input for image uploads
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Image will be inserted via the editor's internal methods

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             <WysiwygEditor
//                 key={editorKey}
//                 placeholder="Start typing..."
//                 initialContent={initialContent || undefined}
//             >
//                 <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2">
//                     {/* Image Upload Button */}
//                     <div className="flex items-center">
//                         <input
//                             type="file"
//                             ref={fileInputRef}
//                             onChange={handleFileChange}
//                             accept="image/*"
//                             className="hidden"
//                             id="image-upload"
//                         />
//                         <label
//                             htmlFor="image-upload"
//                             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         >
//                             <Camera size={18} className="text-gray-600" />
//                             <span className="ml-2">Upload Image</span>
//                         </label>
//                     </div>

//                     {/* Code Block Button - using WysiwygEditor's built-in commands */}
//                     <button
//                         onClick={() => {
//                             // Use the editor's internal methods for toggling code block
//                             // This avoids direct dependency on hook imports
//                             const element =
//                                 document.querySelector('.ProseMirror')
//                             if (element) {
//                                 const selection = window.getSelection()
//                                 if (selection && selection.rangeCount > 0) {
//                                     // Focus the editor first
//                                     // element.focus();

//                                     // Execute the command via document.execCommand
//                                     try {
//                                         // Try to use built-in commands first
//                                         document.execCommand(
//                                             'formatBlock',
//                                             false,
//                                             '<pre>'
//                                         )
//                                     } catch (e) {
//                                         console.log(
//                                             'Code block command failed, editor might handle this internally'
//                                         )
//                                     }
//                                 }
//                             }
//                         }}
//                         className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         title="Toggle Code Block"
//                         type="button"
//                     >
//                         <Code size={18} className="text-gray-600" />
//                         <span className="ml-2">Code Block</span>
//                     </button>

//                     {/* Blockquote Button - using WysiwygEditor's built-in commands */}
//                     <button
//                         onClick={() => {
//                             // Use the editor's internal methods for toggling blockquote
//                             // This avoids direct dependency on hook imports
//                             const element =
//                                 document.querySelector('.ProseMirror')
//                             if (element) {
//                                 const selection = window.getSelection()
//                                 if (selection && selection.rangeCount > 0) {
//                                     // Focus the editor first
//                                     // element.focus();

//                                     // Execute the command via document.execCommand
//                                     try {
//                                         // Try to use built-in commands first
//                                         document.execCommand(
//                                             'formatBlock',
//                                             false,
//                                             '<blockquote>'
//                                         )
//                                     } catch (e) {
//                                         console.log(
//                                             'Blockquote command failed, editor might handle this internally'
//                                         )
//                                     }
//                                 }
//                             }
//                         }}
//                         className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         title="Toggle Blockquote"
//                         type="button"
//                     >
//                         <Quote size={18} className="text-gray-600" />
//                         <span className="ml-2">Blockquote</span>
//                     </button>
//                 </div>
//                 <OnChangeJSON onChange={handleEditorChange} />
//             </WysiwygEditor>
//         </ScrollArea>
//     )
// }

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// // Keep the original import that worked in your code
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { useCommands } from '@remirror/react'

// export const RemirrorTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     const { toggleCodeBlock } = useCommands()

//     const handleToggleCode = () => {
//         toggleCodeBlock()
//     }

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     // Reference to file input for image uploads
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Image will be inserted via the editor's internal methods

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             <WysiwygEditor
//                 key={editorKey}
//                 placeholder="Start typing..."
//                 initialContent={initialContent || undefined}
//             >
//                 {/* Editor Toolbar - Positioned at the top */}
//                 <div className="sticky top-0 z-10 bg-white pb-2 mb-4 shadow-sm border-b border-gray-100 px-2 py-1">
//                     <div className="flex flex-wrap items-center gap-2">
//                         {/* Image Upload Button */}
//                         <div className="flex items-center">
//                             <input
//                                 type="file"
//                                 ref={fileInputRef}
//                                 onChange={handleFileChange}
//                                 accept="image/*"
//                                 className="hidden"
//                                 id="image-upload"
//                             />
//                             <label
//                                 htmlFor="image-upload"
//                                 className="flex items-center px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 transition-colors"
//                             >
//                                 <Camera size={18} className="text-gray-600" />
//                                 <span className="ml-2 text-sm">Image</span>
//                             </label>
//                         </div>

//                         {/* Code Block Button */}
//                         {/* <button
//                             onClick={() => {
//                                 // Use the editor's internal methods for toggling code block
//                                 const element =
//                                     document.querySelector('.ProseMirror')
//                                 if (element) {
//                                     const selection = window.getSelection()
//                                     if (selection && selection.rangeCount > 0) {
//                                         // Focus the editor first
//                                         // element.focus()

//                                         // Execute the command via document.execCommand
//                                         try {
//                                             document.execCommand(
//                                                 'formatBlock',
//                                                 false,
//                                                 '<pre>'
//                                             )
//                                         } catch (e) {
//                                             console.log(
//                                                 'Code block command failed, editor might handle this internally'
//                                             )
//                                         }
//                                     }
//                                 }
//                             }}
//                             className="flex items-center px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 transition-colors"
//                             title="Toggle Code Block"
//                             type="button"
//                         >
//                             <Code size={18} className="text-gray-600" />
//                             <span className="ml-2 text-sm">Code</span>
//                         </button> */}

//                         <button
//                             onClick={handleToggleCode}
//                             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                             title="Toggle Code Block"
//                             type="button"
//                         >
//                             <Code size={18} className="text-gray-600" />
//                             <span className="ml-2">Code Block</span>
//                         </button>

//                         {/* Blockquote Button */}
//                         <button
//                             onClick={() => {
//                                 // Use the editor's internal methods for toggling blockquote
//                                 const element =
//                                     document.querySelector('.ProseMirror')
//                                 if (element) {
//                                     const selection = window.getSelection()
//                                     if (selection && selection.rangeCount > 0) {
//                                         // Focus the editor first
//                                         // element.focus()

//                                         // Execute the command via document.execCommand
//                                         try {
//                                             document.execCommand(
//                                                 'formatBlock',
//                                                 false,
//                                                 '<blockquote>'
//                                             )
//                                         } catch (e) {
//                                             console.log(
//                                                 'Blockquote command failed, editor might handle this internally'
//                                             )
//                                         }
//                                     }
//                                 }
//                             }}
//                             className="flex items-center px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 transition-colors"
//                             title="Toggle Blockquote"
//                             type="button"
//                         >
//                             <Quote size={18} className="text-gray-600" />
//                             <span className="ml-2 text-sm">Quote</span>
//                         </button>
//                     </div>
//                 </div>
//                 <OnChangeJSON onChange={handleEditorChange} />
//             </WysiwygEditor>
//         </ScrollArea>
//     )
// }

// %%%%%%%%%%%%%%%%%%%% Final code with ImageUpload, CodeBlock & Blockquote %%%%%%%%%%%%%%%%%%%%%%%%%%%
// <ImageUploadButton />
// <CodeBlockButton />
// <BlockquoteButton />

// 'use client'

// import React, { useCallback, useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { OnChangeJSON } from '@remirror/react'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { useCommands } from '@remirror/react'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// interface MyEditorProps {
//     onChange: (json: RemirrorJSON) => void
//     initialContent?: RemirrorJSON
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// // Create a custom toolbar button for code blocks
// const CodeBlockButton = () => {
//     const { toggleCodeBlock } = useCommands()

//     const handleToggleCode = () => {
//         toggleCodeBlock()
//     }

//     return (
//         <button
//             onClick={handleToggleCode}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Code Block"
//             type="button"
//         >
//             <Code size={18} className="text-gray-600" />
//             <span className="ml-2">Code Block</span>
//         </button>
//     )
// }

// // Create a custom toolbar button for blockquotes
// const BlockquoteButton = () => {
//     const { toggleBlockquote } = useCommands()

//     const handleToggleBlockquote = () => {
//         toggleBlockquote()
//     }

//     return (
//         <button
//             onClick={handleToggleBlockquote}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Blockquote"
//             type="button"
//         >
//             <Quote size={18} className="text-gray-600" />
//             <span className="ml-2">Blockquote</span>
//         </button>
//     )
// }

// export const RemirrorTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track the editor key to force remounts when initialContent changes significantly
//     const [editorKey, setEditorKey] = useState<number>(0)

//     // Store the last seen initialContent to detect changes
//     const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

//     // Track if the editor has received initial focus
//     const hasInitialFocus = useRef<boolean>(false)

//     // Track if we're in the middle of editing
//     const isEditingRef = useRef<boolean>(false)

//     // Handle debounced updates to parent
//     const debouncedUpdate = useCallback(
//         (json: RemirrorJSON) => {
//             isEditingRef.current = true
//             setInitialContent(json)
//         },
//         [setInitialContent]
//     )

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         (json: RemirrorJSON) => {
//             // Mark that we've started editing
//             hasInitialFocus.current = true

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 debouncedUpdate(json)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [debouncedUpdate]
//     )

//     // Effect to handle external initialContent updates
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         // Check if content has significantly changed from external source
//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             // If it's a significant change, force a remount
//             lastContentRef.current = currentContentString
//             setEditorKey((prevKey) => prevKey + 1)
//         }

//         // Reset editing flag after each external update check
//         isEditingRef.current = false
//     }, [initialContent])

//     return (
//         <ScrollArea
//             className="h-96 pr-8 "
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             <WysiwygEditor
//                 key={editorKey}
//                 placeholder="Start typing..."
//                 initialContent={initialContent || undefined}
//             >
//                 <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2">
//                     <ImageUploadButton />
//                     <CodeBlockButton />
//                     <BlockquoteButton />
//                 </div>
//                 <OnChangeJSON onChange={handleEditorChange} />
//             </WysiwygEditor>
//         </ScrollArea>
//     )
// }

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// 'use client'

// import React, { useState, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
// import { OnChangeJSON } from '@remirror/react'

// export const RemirrorTextEditor = ({
//     initialContent,
//     setInitialContent,
// }: {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }) => {
//     // Track editor state
//     const [editorKey, setEditorKey] = useState(0)
//     const lastContentRef = useRef(JSON.stringify(initialContent || {}))
//     const isEditingRef = useRef(false)

//     // Handle changes from the editor
//     const handleEditorChange = (json: RemirrorJSON) => {
//         isEditingRef.current = true

//         // Debounce updates to parent
//         const timeoutId = setTimeout(() => {
//             setInitialContent(json)
//             isEditingRef.current = false
//         }, 300)

//         return () => clearTimeout(timeoutId)
//     }

//     // Reset editor if content changes externally
//     useEffect(() => {
//         const currentContentString = JSON.stringify(initialContent || {})

//         if (
//             currentContentString !== lastContentRef.current &&
//             !isEditingRef.current
//         ) {
//             lastContentRef.current = currentContentString
//             setEditorKey((prev) => prev + 1)
//         }
//     }, [initialContent])

//     // Refs for function handlers
//     const editorRef = useRef<any>(null)

//     // Set up editor ref to access commands
//     const captureEditorRef = (editor: any) => {
//         if (editor) {
//             editorRef.current = editor
//         }
//     }

//     // Custom button functions that use the editor ref
//     const handleInsertImage = () => {
//         const input = document.createElement('input')
//         input.type = 'file'
//         input.accept = 'image/*'

//         input.onchange = (event) => {
//             const file = (event.target as HTMLInputElement).files?.[0]
//             if (!file) return

//             // Create URL and insert image
//             const imageUrl = URL.createObjectURL(file)

//             if (editorRef.current?.view?.state) {
//                 // Access commands through the editor ref
//                 const { commands } = editorRef.current
//                 commands.insertImage({ src: imageUrl, alt: file.name })
//             }
//         }

//         input.click()
//     }

//     const handleToggleCodeBlock = () => {
//         if (editorRef.current?.view?.state) {
//             const { commands } = editorRef.current
//             commands.toggleCodeBlock()
//         }
//     }

//     const handleToggleBlockquote = () => {
//         if (editorRef.current?.view?.state) {
//             const { commands } = editorRef.current
//             commands.toggleBlockquote()
//         }
//     }

//     return (
//         <div className="editor-container relative">
//             {/* Fixed toolbar */}
//             <div className="sticky top-0 z-10 bg-white pb-2 border-b border-gray-200">
//                 <div className="flex flex-wrap gap-2 py-2">
//                     {/* Image Upload Button */}
//                     <button
//                         onClick={handleInsertImage}
//                         className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         title="Upload Image"
//                         type="button"
//                     >
//                         <Camera size={18} className="text-gray-600" />
//                         <span className="ml-2">Upload Image</span>
//                     </button>

//                     {/* Code Block Button */}
//                     <button
//                         onClick={handleToggleCodeBlock}
//                         className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         title="Toggle Code Block"
//                         type="button"
//                     >
//                         <Code size={18} className="text-gray-600" />
//                         <span className="ml-2">Code Block</span>
//                     </button>

//                     {/* Blockquote Button */}
//                     <button
//                         onClick={handleToggleBlockquote}
//                         className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//                         title="Toggle Blockquote"
//                         type="button"
//                     >
//                         <Quote size={18} className="text-gray-600" />
//                         <span className="ml-2">Blockquote</span>
//                     </button>
//                 </div>
//             </div>

//             {/* Hide the default toolbar with CSS */}
//             <style jsx global>{`
//                 .remirror-toolbar-wrapper,
//                 .remirror-toolbar {
//                     display: none !important;
//                 }
//             `}</style>

//             {/* Scrollable editor area */}
//             <ScrollArea
//                 className="h-96 pr-8"
//                 type="hover"
//                 style={{
//                     scrollbarWidth: 'none',
//                     msOverflowStyle: 'none',
//                 }}
//             >
//                 <div className="pt-2">
//                     <WysiwygEditor
//                         key={editorKey}
//                         placeholder="Start typing..."
//                         initialContent={initialContent || undefined}
//                         // onRef={captureEditorRef}
//                         autoFocus
//                         // classNames={{
//                         //   root: 'prose max-w-none focus:outline-none'
//                         // }}
//                     >
//                         <OnChangeJSON onChange={handleEditorChange} />
//                     </WysiwygEditor>
//                 </div>
//             </ScrollArea>
//         </div>
//     )
// }

// %%%%%%%%%%%%%%%%%%%%%%% Those components with Remirror but how about initial content %%%%%%%%%%%%%%%%%%%%%%%%

// 'use client'

// import React, { useCallback, useRef } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import {
//     useRemirror,
//     Remirror,
//     useCommands,
//     // StateUpdateEvent,
// } from '@remirror/react'
// import {
//     BoldExtension,
//     ItalicExtension,
//     HeadingExtension,
//     CodeBlockExtension,
//     ImageExtension,
//     BlockquoteExtension,
//     CalloutExtension,
// } from 'remirror/extensions'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { EditorComponent } from '@remirror/react'

// interface RemirrorTextEditorProps {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// // Create a custom toolbar button for code blocks
// const CodeBlockButton = () => {
//     const { toggleCodeBlock } = useCommands()

//     const handleToggleCode = () => {
//         toggleCodeBlock()
//     }

//     return (
//         <button
//             onClick={handleToggleCode}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Code Block"
//             type="button"
//         >
//             <Code size={18} className="text-gray-600" />
//             <span className="ml-2">Code Block</span>
//         </button>
//     )
// }

// // Create a custom toolbar button for blockquotes
// const BlockquoteButton = () => {
//     const { toggleBlockquote } = useCommands()

//     const handleToggleBlockquote = () => {
//         toggleBlockquote()
//     }

//     return (
//         <button
//             onClick={handleToggleBlockquote}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Blockquote"
//             type="button"
//         >
//             <Quote size={18} className="text-gray-600" />
//             <span className="ml-2">Blockquote</span>
//         </button>
//     )
// }

// export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
//     initialContent,
//     setInitialContent,
// }) => {
//     // Setup the Remirror manager with needed extensions
//     const { manager, state } = useRemirror({
//         extensions: () => [
//             new HeadingExtension({}),
//             new BoldExtension({}),
//             new ItalicExtension({}),
//             new CodeBlockExtension({}),
//             new ImageExtension({}),
//             new BlockquoteExtension({}),
//             new CalloutExtension({ defaultType: 'warn' }),
//         ],
//         content: initialContent || undefined,
//         selection: 'end',
//     })

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         ({ state }: { state: any }) => {
//             // Convert the current state to JSON and send it to parent
//             const json = state.toJSON()
//             const timeoutId = setTimeout(() => {
//                 setInitialContent(json as RemirrorJSON)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [setInitialContent]
//     )

//     console.log('initialContent', initialContent)
//     console.log('state', state)

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none',
//                 msOverflowStyle: 'none',
//             }}
//         >
//             <Remirror
//                 manager={manager}
//                 initialContent={state}
//                 onChange={handleEditorChange}
//                 placeholder="Start typing..."
//             >
//                 <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2">
//                     <ImageUploadButton />
//                     <CodeBlockButton />
//                     <BlockquoteButton />
//                 </div>
//                 <div className="remirror-editor-wrapper p-4 min-h-[300px] border rounded">
//                     <EditorComponent />
//                 </div>
//             </Remirror>
//         </ScrollArea>
//     )
// }

// export default RemirrorTextEditor

// %%%%%%%%%%%%%%%%%%%%%%% For initial content in Remirror $$$$$$$$$$$$$$$

// 'use client'

// import React, { useCallback, useRef, useEffect } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { useRemirror, Remirror, useCommands } from '@remirror/react'
// import {
//     BoldExtension,
//     ItalicExtension,
//     HeadingExtension,
//     CodeBlockExtension,
//     ImageExtension,
//     BlockquoteExtension,
//     CalloutExtension,
// } from 'remirror/extensions'
// import { EditorComponent } from '@remirror/react'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'

// interface RemirrorTextEditorProps {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// // Create a custom toolbar button for code blocks
// const CodeBlockButton = () => {
//     const { toggleCodeBlock } = useCommands()

//     const handleToggleCode = () => {
//         toggleCodeBlock()
//     }

//     return (
//         <button
//             onClick={handleToggleCode}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Code Block"
//             type="button"
//         >
//             <Code size={18} className="text-gray-600" />
//             <span className="ml-2">Code Block</span>
//         </button>
//     )
// }

// // Create a custom toolbar button for blockquotes
// const BlockquoteButton = () => {
//     const { toggleBlockquote } = useCommands()

//     const handleToggleBlockquote = () => {
//         toggleBlockquote()
//     }

//     return (
//         <button
//             onClick={handleToggleBlockquote}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Blockquote"
//             type="button"
//         >
//             <Quote size={18} className="text-gray-600" />
//             <span className="ml-2">Blockquote</span>
//         </button>
//     )
// }

// // Create a simple default content if needed
// const createDefaultContent = () => {
//     return {
//         type: 'doc',
//         content: [
//             {
//                 type: 'paragraph',
//                 content: [{ type: 'text', text: 'Start typing here...' }],
//             },
//         ],
//     }
// }

// export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
//     initialContent,
//     setInitialContent,
// }) => {
//     // Track if we're in the middle of editing to prevent feedback loops
//     const isEditingRef = useRef<boolean>(false)

//     // Reference to compare content changes
//     const contentRef = useRef<string>(
//         JSON.stringify(initialContent || createDefaultContent())
//     )

//     // Setup the Remirror manager with needed extensions
//     const { manager, state } = useRemirror({
//         extensions: () => [
//             new HeadingExtension({}),
//             new BoldExtension({}),
//             new ItalicExtension({}),
//             new CodeBlockExtension({}),
//             new ImageExtension({}),
//             new BlockquoteExtension({}),
//             new CalloutExtension({ defaultType: 'warn' }),
//         ],
//         // Use fallback content if initialContent is potentially invalid
//         content: createDefaultContent(),
//         selection: 'end',
//         // Add error handler for content validation issues
//         onError: (error) => {
//             console.warn('Content validation error:', error)
//             // Return default content on error
//             return createDefaultContent()
//         },
//     })

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         ({ state }: { state: any }) => {
//             // Mark that we're editing to prevent setState feedback loops
//             isEditingRef.current = true

//             // Convert the current state to JSON and send it to parent
//             const json = state.toJSON()

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 setInitialContent(json)

//                 // Update our reference content
//                 contentRef.current = JSON.stringify(json)

//                 // Reset editing flag after debounce
//                 setTimeout(() => {
//                     isEditingRef.current = false
//                 }, 50)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [setInitialContent]
//     )

//     // Effect to apply valid initialContent when available
//     useEffect(() => {
//         // Skip if we're currently editing to prevent feedback loops
//         if (isEditingRef.current || !initialContent) return

//         try {
//             // Try to update the content carefully
//             const safeContent = initialContent || createDefaultContent()
//             const currentContentString = JSON.stringify(safeContent)

//             // Only update if content has actually changed
//             if (currentContentString !== contentRef.current) {
//                 contentRef.current = currentContentString

//                 try {
//                     // Try to create a valid state with error handling
//                     const newState = manager.createState({
//                         content: safeContent,
//                         selection: 'end',
//                     })

//                     // Update if state creation succeeded
//                     manager.view.updateState(newState)
//                 } catch (err) {
//                     console.warn('Failed to update editor state:', err)
//                     // Continue with current state on error
//                 }
//             }
//         } catch (err) {
//             console.warn('Error processing initialContent:', err)
//         }
//     }, [initialContent, manager])

//     console.log('initialContent', initialContent)
//     console.log('initialContent', initialContent)

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none',
//                 msOverflowStyle: 'none',
//             }}
//         >
//             <div className="p-1 border rounded shadow">
//                 <Remirror
//                     manager={manager}
//                     initialContent={state}
//                     onChange={handleEditorChange}
//                     placeholder="Start typing..."
//                 >
//                     <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2 border-b p-2 mb-2">
//                         <ImageUploadButton />
//                         <CodeBlockButton />
//                         <BlockquoteButton />
//                     </div>
//                     <div className="remirror-editor-wrapper p-4 min-h-[250px]">
//                         <EditorComponent />
//                     </div>
//                 </Remirror>
//             </div>
//         </ScrollArea>
//     )
// }

// export default RemirrorTextEditor

// (((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))
// Chat GPT
// 'use client'

// import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
// import type { RemirrorJSON } from 'remirror'
// import { useRemirror, Remirror, useCommands } from '@remirror/react'
// import {
//     BoldExtension,
//     ItalicExtension,
//     HeadingExtension,
//     CodeBlockExtension,
//     ImageExtension,
//     BlockquoteExtension,
//     CalloutExtension,
//     UnderlineExtension,
//     StrikeExtension,
//     NodeFormattingExtension,
//     ListItemExtension,
//     BulletListExtension,
//     OrderedListExtension,
//     HorizontalRuleExtension,
// } from 'remirror/extensions'
// import { EditorComponent } from '@remirror/react'
// import { Camera, Code, Quote } from 'lucide-react'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { RemirrorManager } from 'remirror'
// import {
//     DocExtension,
//     ParagraphExtension,
//     TextExtension,
// } from 'remirror/extensions'

// interface RemirrorTextEditorProps {
//     initialContent: RemirrorJSON | null | undefined
//     setInitialContent: (content: any) => void
// }

// // Create a custom toolbar button for image uploads
// const ImageUploadButton = () => {
//     const { insertImage } = useCommands()
//     const fileInputRef = useRef<HTMLInputElement>(null)

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]
//         if (!file) return

//         // Create a URL for the uploaded image
//         const imageUrl = URL.createObjectURL(file)

//         // Insert the image into the editor
//         insertImage({ src: imageUrl, alt: file.name })

//         // Reset the file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }

//     return (
//         <div className="flex items-center">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="image-upload"
//             />
//             <label
//                 htmlFor="image-upload"
//                 className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             >
//                 <Camera size={18} className="text-gray-600" />
//                 <span className="ml-2">Upload Image</span>
//             </label>
//         </div>
//     )
// }

// // Create a custom toolbar button for code blocks
// const CodeBlockButton = () => {
//     const { toggleCodeBlock } = useCommands()

//     const handleToggleCode = () => {
//         toggleCodeBlock()
//     }

//     return (
//         <button
//             onClick={handleToggleCode}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Code Block"
//             type="button"
//         >
//             <Code size={18} className="text-gray-600" />
//             <span className="ml-2">Code Block</span>
//         </button>
//     )
// }

// // Create a custom toolbar button for blockquotes
// const BlockquoteButton = () => {
//     const { toggleBlockquote } = useCommands()

//     const handleToggleBlockquote = () => {
//         toggleBlockquote()
//     }

//     return (
//         <button
//             onClick={handleToggleBlockquote}
//             className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
//             title="Toggle Blockquote"
//             type="button"
//         >
//             <Quote size={18} className="text-gray-600" />
//             <span className="ml-2">Blockquote</span>
//         </button>
//     )
// }

// // Create a simple default content if needed
// const createDefaultContent = () => {
//     return {
//         type: 'doc',
//         content: [
//             {
//                 type: 'paragraph',
//                 content: [{ type: 'text', text: 'Start typing here...' }],
//             },
//         ],
//     }
// }

// export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
//     initialContent,
//     setInitialContent,
// }) => {
//     // State to track if we're editing to prevent feedback loops
//     const [isEditing, setIsEditing] = useState(false)

//     // State to force rerenders when needed
//     const [key, setKey] = useState(0)

//     // Effect to rerender when initialContent changes significantly
//     useEffect(() => {
//         if (isEditing) return

//         // Force rerender with new key when initialContent changes
//         setKey((prev) => prev + 1)
//     }, [initialContent, isEditing])

//     // Get safe initial content
//     // const safeInitialContent =
//     //     initialContent &&
//     //     initialContent.type === 'doc' &&
//     //     Array.isArray(initialContent.content)
//     //         ? initialContent
//     //         : createDefaultContent()
//     // const safeInitialContent = useMemo(
//     //     () => initialContent ?? undefined,
//     //     [initialContent]
//     // )
//     const safeInitialContent = useMemo(() => {
//         return (
//             initialContent ?? {
//                 type: 'doc',
//                 content: [{ type: 'paragraph' }],
//             }
//         )
//     }, [initialContent])

//     const { manager, state } = useMemo(() => {
//         return useRemirror({
//             extensions: () => [
//                 new DocExtension({}), // Required
//                 new ParagraphExtension(), // Required
//                 new TextExtension(), // Required
//                 new HeadingExtension({}),
//                 new BoldExtension({}),
//                 new ItalicExtension({}),
//                 new UnderlineExtension({}),
//                 new StrikeExtension({}),
//                 new CodeBlockExtension({}),
//                 new ImageExtension({}),
//                 new BlockquoteExtension({}),
//                 new CalloutExtension({ defaultType: 'warn' }),
//                 new NodeFormattingExtension({}),
//                 new ListItemExtension({}),
//                 new BulletListExtension({}),
//                 new OrderedListExtension({}),
//                 new HorizontalRuleExtension({}),
//             ],
//             content: safeInitialContent,
//             selection: 'end',
//             stringHandler: 'markdown', // using JSON based on your content
//         })
//     }, [safeInitialContent])

//     // Handle changes from the editor
//     const handleEditorChange = useCallback(
//         ((params?: { state?: any })) => {
//             if (!params?.state) return;
//             setIsEditing(true)

//             // Convert the current state to JSON and send it to parent
//             const json = params?.state?.doc?.toJSON?.()

//             // Debounce updates to parent
//             const timeoutId = setTimeout(() => {
//                 setInitialContent(json)

//                 // Reset editing flag after debounce
//                 setTimeout(() => {
//                     setIsEditing(false)
//                 }, 100)
//             }, 300)

//             return () => clearTimeout(timeoutId)
//         },
//         [setInitialContent]
//     )

//     console.log('safeInitialContent', safeInitialContent)
//     console.log('initialContent', initialContent)
//     console.log('state', state)

//     return (
//         <ScrollArea
//             className="h-96 pr-8"
//             type="hover"
//             style={{
//                 scrollbarWidth: 'none',
//                 msOverflowStyle: 'none',
//             }}
//         >
//             <div className="p-1 border rounded shadow" key={key}>
//                 <Remirror
//                     manager={manager}
//                     initialContent={safeInitialContent}
//                     onChange={handleEditorChange}
//                     placeholder="Start typing..."
//                 >
//                     <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2 border-b p-2 mb-2">
//                         <ImageUploadButton />
//                         <CodeBlockButton />
//                         <BlockquoteButton />
//                     </div>
//                     <div className="remirror-editor-wrapper p-4 min-h-[250px]">
//                         <EditorComponent />
//                     </div>
//                 </Remirror>
//             </div>
//         </ScrollArea>
//     )
// }

// export default RemirrorTextEditor

// ##################################################################################

'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import type { RemirrorJSON } from 'remirror'
import {
    useRemirror,
    Remirror,
    useCommands,
    // StateUpdateEvent,
} from '@remirror/react'
import {
    BoldExtension,
    ItalicExtension,
    HeadingExtension,
    CodeBlockExtension,
    ImageExtension,
    BlockquoteExtension,
    CalloutExtension,
} from 'remirror/extensions'
import { Camera, Code, Quote } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EditorComponent } from '@remirror/react'

interface RemirrorTextEditorProps {
    initialContent: RemirrorJSON | null | undefined
    setInitialContent: (content: any) => void
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

// Create a custom toolbar button for code blocks
const CodeBlockButton = () => {
    const { toggleCodeBlock } = useCommands()

    const handleToggleCode = () => {
        toggleCodeBlock()
    }

    return (
        <button
            onClick={handleToggleCode}
            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            title="Toggle Code Block"
            type="button"
        >
            <Code size={18} className="text-gray-600" />
            <span className="ml-2">Code Block</span>
        </button>
    )
}

// Create a custom toolbar button for blockquotes
const BlockquoteButton = () => {
    const { toggleBlockquote } = useCommands()

    const handleToggleBlockquote = () => {
        toggleBlockquote()
    }

    return (
        <button
            onClick={handleToggleBlockquote}
            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            title="Toggle Blockquote"
            type="button"
        >
            <Quote size={18} className="text-gray-600" />
            <span className="ml-2">Blockquote</span>
        </button>
    )
}

export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
    initialContent,
    setInitialContent,
}) => {
    // Setup the Remirror manager with needed extensions
    const { manager, state } = useRemirror({
        extensions: () => [
            new HeadingExtension({}),
            new BoldExtension({}),
            new ItalicExtension({}),
            new CodeBlockExtension({}),
            new ImageExtension({}),
            new BlockquoteExtension({}),
            new CalloutExtension({ defaultType: 'warn' }),
        ],
        content: initialContent || undefined,
        selection: 'end',
    })

    // Handle changes from the editor
    const handleEditorChange = useCallback(
        ({ state }: { state: any }) => {
            // Convert the current state to JSON and send it to parent
            const json = state.toJSON()
            console.log('Editor content JSON:', json)
            const timeoutId = setTimeout(() => {
                setInitialContent(json as RemirrorJSON)
            }, 300)

            return () => clearTimeout(timeoutId)
        },
        [setInitialContent]
    )

    useEffect(() => {
        if (state) {
            const json = state.toJSON()
            console.log('Initial content JSON:', json)
        }
    }, [state])

    console.log('initialContent', initialContent)
    console.log('state', state)

    return (
        <ScrollArea
            className="h-96 pr-8"
            type="hover"
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <Remirror
                manager={manager}
                initialContent={state}
                onChange={handleEditorChange}
                placeholder="Start typing..."
            >
                <div className="sticky top-0 z-10 bg-white pb-2 flex flex-wrap gap-2">
                    <ImageUploadButton />
                    <CodeBlockButton />
                    <BlockquoteButton />
                </div>
                <div className="remirror-editor-wrapper p-4 min-h-[300px] border rounded">
                    <EditorComponent />
                </div>
            </Remirror>
        </ScrollArea>
    )
}

export default RemirrorTextEditor
