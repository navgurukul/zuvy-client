import React from 'react'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

const RemirrorForForm = ({
    description,
    onChange,
    onValidationChange, // New prop
}: {
    description: String
    onChange: (richText: String) => void
    onValidationChange: (isValid: boolean) => void // New prop type
}) => {
    return (
        <RemirrorForm
            description={description}
            onChange={onChange}
            onValidationChange={onValidationChange} // Pass the prop
        />
    )
}

export default RemirrorForForm
