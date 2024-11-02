type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    selectedQuestionIds: number[]
}

const CheckboxAndDeleteHandler: React.FC<CheckboxProps> = ({
    checked,
    onCheckedChange,
    selectedQuestionIds,
    ...props
}) => {
    console.log(selectedQuestionIds)

    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            {...props}
        />
    )
}

export default CheckboxAndDeleteHandler
