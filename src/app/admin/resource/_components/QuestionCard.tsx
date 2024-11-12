import React from 'react'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuestionCardProps {
    question: string
    options: { [key: string]: string }
    correctOption: number
}

const QuestionCard = ({
    question,
    options,
    correctOption,
}: QuestionCardProps) => {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="bg-gray-100 border-b">
                <h3 className="text-lg font-medium">{question}</h3>
            </CardHeader>
            {/* <CardBody> */}
            <div className="space-y-2">
                {Object.entries(options).map(([key, option]) => (
                    <div
                        key={key}
                        className={`px-4 py-3 rounded-md transition-colors hover:bg-gray-100 ${
                            parseInt(key) === correctOption
                                ? 'bg-green-100'
                                : ''
                        }`}
                    >
                        <span className="font-medium mr-2">{key}.</span>
                        {option}
                    </div>
                ))}
            </div>
            {/* </CardBody> */}
            {/* <CardFooter className="flex justify-end">
        <Button variant="primary">Submit</Button>
      </CardFooter> */}
        </Card>
    )
}
