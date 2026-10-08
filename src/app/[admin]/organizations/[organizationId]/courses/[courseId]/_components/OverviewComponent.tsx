import {
    AlertTriangle,
    CheckSquare,
    Code,
    Copy,
    Monitor,
    Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { OverviewComponentProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
const OverviewComponent = (props: OverviewComponentProps) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-left text-lg font-semibold mb-4">
                    Score Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 text-center">
                            <Trophy className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <p className="text-sm text-muted-foreground mb-1">
                                Total Score
                            </p>
                            <p className="text-2xl font-bold text-primary">
                                {Math.floor(props.score)}%
                            </p>
                        </CardContent>
                    </Card>

                    {props.totalCodingChallenges > 0 && (
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Code className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                    Coding Challenges
                                </p>
                                <p className="text-xl font-bold">
                                    {Math.trunc(props.codingScore)}/{' '}
                                    {props.totalCodingScore}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {props.totalCorrectedMcqs > 0 && (
                        <Card>
                            <CardContent className="p-4 text-center">
                                <CheckSquare className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                    MCQs
                                </p>
                                <p className="text-xl font-bold">
                                    {Math.trunc(props.mcqScore)} /{' '}
                                    {props.totalMcqScore}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <div>
                <h3 className="text-left text-lg font-semibold mb-4">
                    Proctoring Report
                </h3>
                {!props?.proctoringData?.canCopyPaste &&
                !props?.proctoringData?.canTabChange &&
                !props?.proctoringData?.canScreenExit ? (
                    <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30">
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-600 dark:text-red-400" />
                            <p className="text-base font-semibold text-red-600 dark:text-red-400">
                                No Proctoring Enabled By the Admin
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {props?.proctoringData?.canCopyPaste && (
                            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-950/30">
                                <CardContent className="p-4 text-center">
                                    <Copy className="h-5 w-5 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                        {props.copyPaste ||
                                        props.copyPaste === 0
                                            ? props.copyPaste
                                            : 'None'}
                                    </p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Copy Paste
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {props?.proctoringData?.canTabChange && (
                            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-950/30">
                                <CardContent className="p-4 text-center">
                                    <Monitor className="h-5 w-5 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                        {props.tabchanges ||
                                        props.tabchanges === 0
                                            ? props.tabchanges
                                            : 'None'}
                                    </p>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        Tab Changes
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {props?.proctoringData?.canScreenExit && (
                            <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30">
                                <CardContent className="p-4 text-center">
                                    <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-600 dark:text-red-400" />
                                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                                        {props.fullScreenExit ||
                                        props.fullScreenExit === 0
                                            ? props.fullScreenExit
                                            : 'None'}
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Full Screen Exits
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OverviewComponent
