type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
}

const CheckboxAndDeleteHandler: React.FC<CheckboxProps> = ({
    checked,
    onCheckedChange,

    ...props
}) => {
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
