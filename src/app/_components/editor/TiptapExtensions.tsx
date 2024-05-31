import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'

const extensions = [
    StarterKit,
    Underline,
    ListItem,
    Text,
    Image,
    Document,
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Youtube.configure({
        HTMLAttributes: {
            class: 'w-2/4 resize flex justify-center items-center bg-gray-200 rounded-md m-auto',
        },
        inline: false,
        width: 480,
        height: 320,
        nocookie: true,
        ccLanguage: 'es',
        ccLoadPolicy: true,
        enableIFrameApi: true,
        origin: 'app.zuvy.org',
    }),
    Paragraph.configure({
        HTMLAttributes: {
            class: 'resize',
        },
    }),
    BulletList.configure({
        itemTypeName: 'listItem',
        HTMLAttributes: {
            class: 'list-disc inline-block text-left',
        },
    }),
    OrderedList.configure({
        HTMLAttributes: {
            class: 'list-decimal inline-block text-left',
        },
    }),
    Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
            class: 'font-bold text-secondary',
        },
    }),
    Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
    }),
    Image.configure({
        HTMLAttributes: {
            class: 'w-2/4 resize flex justify-center items-center bg-gray-200 rounded-md m-auto',
        },
        inline: true,
    }),
]

export default extensions
