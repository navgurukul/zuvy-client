"use client"
import React, { useState, useMemo,useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchParams } from "next/navigation"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Spinner } from '@/components/ui/spinner'
import { Label } from '@/components/ui/label'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataTable } from '@/app/_components/datatable/data-table'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Users,
    Plus,
    Eye,
    Mail,
    Calendar,
    Edit,
    UserCheck,
    Upload,
    UserPlus,
    Trash2,
} from 'lucide-react'
import {
    StudentData,
    BatchSuggestion,
    StudentDataState,
    ParamsType,
    EnhancedBatch,
    PermissionsType,
} from './courseBatchesType'
import useBatches from '@/hooks/useBatches'
import { SearchBox } from '@/utils/searchBox'
import DeleteConfirmationModal from '../../_components/deleteModal'
import Dropzone from '../../_components/dropzone'
import AddStudentOptions from '../../_components/AddStudentOptions'
import {BatchesSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'

const Page = ({ params }: { params: ParamsType }) => {
    // Use the extracted hook for all logic and state
    const {
        courseData,
        enhancedBatchData,
        loading,
        permissions,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingBatch,
        setEditingBatch,
        currentStep,
        setCurrentStep,
        batchToDelete,
        setBatchToDelete,
        assignStudents,
        setAssignStudents,
        manualAssignmentMethod,
        setManualAssignmentMethod,
        selectedRows,
        setSelectedRows,
        totalStudents,
        searchStudent,
        handleSearchStudents,
        studentData,
        setStudentData,
        isManualValid,
        setIsManualValid,
        setSingleStudentData,
        searchQuery,
        csvFile,
        setCsvFile,
        singleStudentData,
        handleSingleStudentChange,
        fetchSuggestionsApi,
        fetchSearchResultsApi,
        defaultFetchApi,
        handleEditBatch,
        handleDeleteBatch,
        batchDeleteHandler,
        handleUpdateBatch,
        handleViewStudents,
        handleCsvFileChange,
        onSubmit,
        columns,
        getStatusColor,
        formatDate,
        assignLearners,
        form,
        getUnAssignedStudents,
        isDeleteModalOpen,
        setDeleteModalOpen,
        totalBatches,
        batchesPerPage,
        setBatchesPerPage,
    } = useBatches(params)

    const searchParams = useSearchParams();
    const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams]);
    const position = useMemo(() => parseInt(searchParams.get('limit') || '10'), [searchParams]); // default 10 optional
    const offset = useMemo(() => (currentPage - 1) * position, [currentPage, position]);
    useEffect(() => {
        setBatchesPerPage(position);   // update hook limit when URL changes
    }, [position, setBatchesPerPage]);
    
    // Local UI-only value derived from the form provided by the hook
    const capEnrollmentValue = form.watch('capEnrollment')

    // Render manual assignment method selection
    const renderManualAssignmentMethod = () => {
        return (
            <div className="space-y-2">
                <RadioGroup
                    value={manualAssignmentMethod}
                    onValueChange={setManualAssignmentMethod}
                    className="flex gap-6"
                >
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="unassigned"
                                id="unassigned"
                            />
                            <Label
                                htmlFor="unassigned"
                                className="font-medium cursor-pointer mt-5"
                            >
                                Unassigned Students
                            </Label>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label
                            htmlFor="single"
                            className="font-medium cursor-pointer mt-5"
                        >
                            Add Single Student
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="csv" />
                        <Label
                            htmlFor="csv"
                            className="font-medium cursor-pointer mt-5"
                        >
                            Upload CSV
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        )
    }

    // Render the selected assignment method content
    const renderAssignmentMethodContent = () => {
        switch (manualAssignmentMethod) {
            case 'unassigned':
                return (
                    <>
                        <p className="text-sm text-muted-foreground ml-2">
                            Unassigned Students in Records:{' '}
                            {courseData?.unassigned_students || 0}
                        </p>
                        <Input
                            type="search"
                            placeholder="Search students"
                            className="w-full mb-3"
                            value={searchStudent}
                            onChange={handleSearchStudents}
                        />
                        <DataTable
                            data={totalStudents}
                            columns={columns}
                            setSelectedRows={setSelectedRows}
                            assignStudents={assignStudents}
                        />
                        <p className="pt-2 text-sm">
                            Total Learners Selected: {selectedRows.length} /{' '}
                            {capEnrollmentValue}
                        </p>
                        {selectedRows.length === 0 && (
                            <p className="text-sm text-red-500">
                                Please select at least one student
                            </p>
                        )}
                    </>
                )

            case 'single':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentName">Student Name *</Label>
                            <Input
                                id="studentName"
                                value={singleStudentData.name}
                                onChange={(e) =>
                                    handleSingleStudentChange(
                                        'name',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter student name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentEmail">
                                Student Email *
                            </Label>
                            <Input
                                id="studentEmail"
                                type="email"
                                value={singleStudentData.email}
                                onChange={(e) =>
                                    handleSingleStudentChange(
                                        'email',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter student email"
                            />
                        </div>
                        {(!singleStudentData.name.trim() ||
                            !singleStudentData.email.trim()) && (
                            <p className="text-sm text-red-500">
                                Both name and email are required
                            </p>
                        )}
                    </div>
                )

            case 'csv':
                return (
                    <div className="space-y-4">
                        {/* Use Dropzone instead of manual file input */}
                        <Dropzone
                            studentData={studentData}
                            setStudentData={setStudentData}
                            className="px-5 py-2 border-dashed border-2 rounded-[10px] block"
                        />
                        <div className="text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    // Download sample CSV
                                    const csvContent =
                                        'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com'
                                    const blob = new Blob([csvContent], {
                                        type: 'text/csv',
                                    })
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = 'sample_students.csv'
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                }}
                            >
                                Download Sample CSV
                            </Button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const isManualAssignmentValid = () => {
        if (manualAssignmentMethod === 'unassigned') {
            return selectedRows.length > 0
        } else if (manualAssignmentMethod === 'single') {
            return (
                singleStudentData.name.trim() && singleStudentData.email.trim()
            )
        } else if (manualAssignmentMethod === 'csv') {
            return (
                studentData &&
                Array.isArray(studentData) &&
                studentData.length > 0
            )
        }
        return false
    }

    const renderModal = (emptyState: boolean) => {
        const shouldShowAddStudentModal = courseData?.unassigned_students === 0
        //  ||  (!batchData || batchData.length === 0)

        if (shouldShowAddStudentModal) {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        {permissions.createBatch && (
                            <Button className="lg:max-w-[200px] w-full mt-5">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Batch
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogOverlay />
                    <AddStudentsModal
                        message={true}
                        id={courseData?.id || 0}
                        batch={false}
                        batchData={enhancedBatchData ? enhancedBatchData.length > 0 : false}
                        batchId={0}
                        setStudentData={setStudentData}
                        studentData={studentData}
                        modalType="both"
                    />
                </Dialog>
            )
        } else {
            return (
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={(open) => setIsCreateModalOpen(open)}
                >
                    <DialogTrigger asChild>
                        {permissions.createBatch && (
                            <Button
                                className="lg:max-w-[200px] w-full mt-5"
                                onClick={() => {
                                    // Reset everything before opening
                                    form.reset({
                                        name: '',
                                        instructorEmail: '',
                                        bootcampId:
                                            courseData?.id.toString() ?? '',
                                        capEnrollment: '',
                                        assignLearners: 'all',
                                    })
                                    setAssignStudents('')
                                    setManualAssignmentMethod('unassigned')
                                    setCsvFile(null)
                                    setSingleStudentData({
                                        name: '',
                                        email: '',
                                    })
                                    setSelectedRows([])
                                    setStudentData({})
                                    setIsCreateModalOpen(true)
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Batch
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                Create New Batch
                            </DialogTitle>
                        </DialogHeader>
                            <DialogDescription className="text-start">
                                {assignStudents === 'manually'
                                    ? 'Choose how you want to add students to this batch'
                                    : `Unassigned Students in Records: ${courseData?.unassigned_students}`}
                            </DialogDescription>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-8 text-start"
                                >
                                    {assignStudents === 'manually' ? (
                                        <div className="space-y-6">
                                            {/* Assignment reusable component */}
                                            <AddStudentOptions
                                                context="create"
                                                courseId={params.courseId}
                                                capEnrollment={
                                                    capEnrollmentValue
                                                }
                                                initialMethod={
                                                    manualAssignmentMethod as any
                                                }
                                                onUnassignedChange={(
                                                    rows: StudentData[]
                                                ) => setSelectedRows(rows)}
                                                onSingleChange={(data: {
                                                    name: string
                                                    email: string
                                                }) =>
                                                    setSingleStudentData(data)
                                                }
                                                onCsvChange={(data: any[]) =>
                                                    setStudentData(data)
                                                }
                                                onValidityChange={(
                                                    v: boolean
                                                ) => setIsManualValid(v)}
                                            />

                                            {/* Action Buttons */}
                                            <div className="flex justify-between w-full pt-4 border-t">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setAssignStudents('')
                                                    }
                                                >
                                                    Back
                                                </Button>
                                                {/* <DialogClose asChild> */}
                                                <Button
                                                    type="button"
                                                    disabled={
                                                        !form.formState
                                                            .isValid ||
                                                        !isManualValid
                                                    }
                                                    onClick={async (e) => {
                                                        e.preventDefault() // Prevent any default form submission
                                                        const formData =
                                                            form.getValues()
                                                        const success =
                                                            await onSubmit(
                                                                formData
                                                            )
                                                        if (success) {
                                                            setIsCreateModalOpen(
                                                                false
                                                            )
                                                        }
                                                    }}
                                                >
                                                    Create Batch
                                                </Button>
                                                {/* </DialogClose> */}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Batch Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Batch Name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="instructorEmail"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Instructor Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="instructor@navgurukul.org"
                                                                type="email"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="capEnrollment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Cap Enrollment
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Cap Enrollment (max: 100,000)"
                                                                type="number"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const value =
                                                                        e.target
                                                                            .value
                                                                    if (
                                                                        value.length <=
                                                                        6
                                                                    ) {
                                                                        field.onChange(
                                                                            e
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="assignLearners"
                                                render={({ field }) => (
                                                    <FormItem className="text-start">
                                                        <FormLabel>
                                                            Assign Learners to
                                                            Batch
                                                        </FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value ||
                                                                    ''
                                                                }
                                                                className="flex gap-4"
                                                            >
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="all" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        All
                                                                        learners
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="manually" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Assign
                                                                        manually
                                                                    </FormLabel>
                                                                </FormItem>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {assignLearners === 'all' && (
                                                <FormDescription>
                                                    {`${
                                                        courseData?.unassigned_students
                                                    } ${
                                                        courseData?.unassigned_students ===
                                                        1
                                                            ? ' student'
                                                            : ' students'
                                                    } will be added to
                                                this batch (Maximum current availability)`}
                                                </FormDescription>
                                            )}

                                            <div className="w-full flex flex-col items-end gap-y-5">
                                                {assignLearners === 'all' ? (
                                                    // <DialogClose asChild>
                                                    <Button
                                                        className="w-1/4"
                                                        type="submit"
                                                        disabled={
                                                            !form.formState
                                                                .isValid
                                                        }
                                                        onClick={async (e) => {
                                                            e.preventDefault()
                                                            const formData =
                                                                form.getValues()
                                                            const success =
                                                                await onSubmit(
                                                                    formData
                                                                )
                                                            if (success) {
                                                                setIsCreateModalOpen(
                                                                    false
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        Create batch
                                                    </Button>
                                                ) : (
                                                    // </DialogClose>
                                                    <Button
                                                        type="button"
                                                        className="w-1/2"
                                                        onClick={() =>
                                                            setAssignStudents(
                                                                'manually'
                                                            )
                                                        }
                                                        disabled={
                                                            !form.formState
                                                                .isValid
                                                        }
                                                    >
                                                        Next: Assign Learners to
                                                        Batch
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </form>
                            </Form>
                    </DialogContent>
                </Dialog>
            )
        }
    }

    const renderEditModal = () => (
        <Dialog
            open={isEditModalOpen}
            onOpenChange={(isOpen) => {
                setIsEditModalOpen(isOpen)
                if (!isOpen) {
                    setEditingBatch(null)
                    form.reset({
                        name: '',
                        instructorEmail: '',
                        bootcampId: courseData?.id.toString() ?? '',
                        capEnrollment: '',
                        assignLearners: 'all',
                    })
                }
            }}
        >
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Edit Batch - {editingBatch?.name}
                    </DialogTitle>
                </DialogHeader>
                    <DialogDescription className="text-start">
                        Update batch details and instructor information.
                    </DialogDescription>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 text-start"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Batch Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instructorEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructor Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="instructor@navgurukul.org"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capEnrollment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cap Enrollment</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Cap Enrollment (max: 100,000)"
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!form.formState.isValid}
                                >
                                    Update Batch
                                </Button>
                            </div>
                        </form>
                    </Form>
            </DialogContent>
        </Dialog>
    )

    if (courseData?.id) {
        return (
            <div className="w-full max-w-none pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-left">
                            Batches
                        </h2>
                        <p className="text-muted-foreground">
                            Organize students into batches for better management
                        </p>
                    </div>
                    {renderModal(false)}
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
                <div className="relative w-full lg:max-w-[500px]">
                            <SearchBox
                                placeholder="Search batches..."
                                fetchSuggestionsApi={fetchSuggestionsApi}
                                fetchSearchResultsApi={fetchSearchResultsApi}
                                defaultFetchApi={defaultFetchApi}
                                getSuggestionLabel={(s) => (
                                    <div>
                                        <div className="font-medium">
                                            {s.name}
                                        </div>
                                    </div>
                                )}
                                inputWidth="relative lg:w-[400px] w-full"
                            />
                        </div>
                    </div>
                {loading ? (
                      <BatchesSkeleton/>  
                ) : (
                    /* Batch Cards Grid - Updated Design */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(enhancedBatchData?.length ?? 0) > 0 ? (
                            enhancedBatchData?.map((batch: EnhancedBatch) => (
                                <Card
                                    key={batch.id}
                                    className="hover:shadow-lg transition-all duration-200 flex flex-col w-full max-w-[420px]"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 text-left">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CardTitle className="text-lg font-semibold mb-2 cursor-pointer">
                                                                {batch.name
                                                                    .length > 25
                                                                    ? batch.name.substring(
                                                                          0,
                                                                          25
                                                                      ) + '...'
                                                                    : batch.name}
                                                            </CardTitle>
                                                        </TooltipTrigger>
                                                        {batch.name.length >
                                                            25 && (
                                                            <TooltipContent>
                                                                {batch.name}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize text-xs ${getStatusColor(
                                                        batch.status
                                                    )}`}
                                                >
                                                    {batch.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1">
                                                {permissions.editBatch && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-primary hover:text-white"
                                                        onClick={() =>
                                                            handleEditBatch(
                                                                batch
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {permissions.editBatch && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-600 hover:bg-red-200 hover:text-red-600 "
                                                        onClick={() =>
                                                            handleDeleteBatch(
                                                                batch
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Instructor:
                                            </span>
                                            <span className="truncate">
                                                {batch.instructorEmail}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Students:
                                            </span>
                                            <span>
                                                {batch.students_enrolled}/
                                                {batch.capEnrollment}
                                            </span>
                                        </div>

                                        {batch.startDate && batch.endDate && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    Duration:
                                                </span>
                                                <span className="text-xs">
                                                    {formatDate(
                                                        batch.startDate
                                                    )}{' '}
                                                    -{' '}
                                                    {formatDate(batch.endDate)}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-4">
                                        <Button
                                           
                                            size="sm"
                                            onClick={() =>
                                                handleViewStudents(
                                                    batch.id,
                                                    batch.name
                                                )
                                            }
                                            className="w-full h-10"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Students
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : searchQuery ? (
                            <div className="col-span-full flex flex-col items-center justify-center gap-y-3 py-12">
                                <div className="text-center">
                                    <p className="text-lg font-medium text-gray-600">
                                        {`No batches found for "${searchQuery}"`}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Try adjusting your search or create a
                                        new batch
                                    </p>
                                </div>
                                {renderModal(true)}
                            </div>
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center gap-y-3 py-12">
                                <Image
                                    src="/batches.svg"
                                    alt="create batch"
                                    width={100}
                                    height={100}
                                />
                                <p className="text-center text-gray-600">
                                    Start by creating the first batch for the
                                    course. Learners will get added
                                    automatically based on enrollment cap
                                </p>
                                {renderModal(true)}
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                {renderEditModal()}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false)
                        setBatchToDelete(null)
                    }}
                    onConfirm={batchDeleteHandler}
                    modalText="Type the batch name to confirm deletion"
                    modalText2="Batch Name"
                    input={true}
                    buttonText="Delete Batch"
                    instructorInfo={batchToDelete}
                    topicId={0}
                    onDeleteChapterWithSession={() => {}}
                />
                <DataTablePagination
                    totalStudents={totalBatches}
                    pages={Math.ceil(totalBatches / position)}
                    lastPage={Math.ceil(totalBatches / position)}
                    fetchStudentData={(offset: number) => defaultFetchApi(offset, position)}
                />
            </div>
        )
    }
    return null
}
export default Page
