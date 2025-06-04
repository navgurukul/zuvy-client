import React from 'react'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

type Props = {}

const RemirrorForForm = ({
    description,
    onChange,
}: {
    description: String
    onChange: (richText: String) => void
}) => {
    return <RemirrorForm description={description} onChange={onChange} />
}

export default RemirrorForForm
