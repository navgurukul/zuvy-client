export const getAvailableInputTypes = <T extends string>(
    inputTypes: readonly T[],
    inputs: ReadonlyArray<{ type: string }>
): T[] => {
    const usedTypes = new Set(inputs.map((input) => input.type))

    return inputTypes.filter((type) => !usedTypes.has(type))
}

export const removeInputFromTestCases = <
    T extends { id: number; inputs: Array<{ id: number; type: string; value: string }> }
>(
    prevTestCases: T[],
    testCaseId: number,
    inputIndex: number,
    firstTestCaseId: number | undefined
) => {
    if (testCaseId !== firstTestCaseId) return prevTestCases

    return prevTestCases.map((testCase) => ({
        ...testCase,
        inputs: testCase.inputs.filter((_, idx) => idx !== inputIndex),
    }))
}

export const validateCodingInputValue = (
    value: string,
    type: string,
    toastError: (options: { title: string; description: string; className?: string }) => void
) => {
    switch (type) {
        case 'arrayOfStr':
        case 'arrayOfnum':
        case 'str': {
            return true
        }
        case 'int': {
            if (!Number.isInteger(Number(value)) && value !== '') {
                toastError({
                    title: 'Invalid Integer Input',
                    description: 'Please enter a valid integer value',
                })
                return false
            }
            break
        }
        case 'float': {
            if (isNaN(Number(value)) && value !== '') {
                toastError({
                    title: 'Invalid Float Input',
                    description: 'Please enter a valid float value',
                })
                return false
            }
            break
        }
        case 'bool': {
            if (
                value &&
                !/^(true|false)$/.test(value) &&
                !/^(t(r(u(e)?)?)?|f(a(l(s(e)?)?)?)?)$/.test(value)
            ) {
                toastError({
                    title: 'Invalid Boolean Input',
                    description: "Please enter either 'true' or 'false'",
                })
                return false
            }
            break
        }
    }

    return true
}