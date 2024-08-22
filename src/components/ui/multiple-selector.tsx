import React from 'react'
import Select, { MultiValue } from 'react-select'

interface Option {
    value: string
    label: string
}

interface MultiSelectProps {
    options: Option[]
    value: MultiValue<Option>
    onChange: (selected: MultiValue<Option>) => void
    isDisabled?: boolean
}

const MultipleSelector: React.FC<MultiSelectProps> = ({
    options,
    value,
    onChange,
    isDisabled = false,
}) => {
    return (
        <Select
            isMulti
            options={options}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            className="w-full text-black"
            classNamePrefix="react-select"
            styles={{
                control: (base, state) => ({
                    ...base,
                    backgroundColor: 'white',
                    borderColor: state.isFocused ? '#10b981' : '#d1d5db', // Green border color when focused
                    boxShadow: state.isFocused ? '0 0 0 1px #518672' : 'none', // Green shadow when focused
                    '&:hover': { borderColor: '#059669' }, // Darker green on hover
                }),
                menu: (base) => ({
                    ...base,
                    zIndex: 20,
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#10b981' : 'white',
                    color: state.isSelected ? 'white' : 'black',
                    '&:hover': { backgroundColor: '#059669', color: 'white' }, // Hover effect
                }),
            }}
        />
    )
}

export default MultipleSelector
