'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Award } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import PermissionAlert from '@/app/_components/PermissionAlert'
import useGetChapterDetails from '@/app/[admin]/hooks/useGetChapterDetails'
import useEditChapter from '@/app/[admin]/hooks/useEditChapter'
import useUploadCertificate from '@/app/[admin]/hooks/useUploadCertificate'
import UploadArticle from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Article/UploadPdf'
import { getUser } from '@/store/store'

interface CertificateChapterProps {
    content: any
    courseId: string | number
    canEdit?: boolean
}

const CertificateChapter: React.FC<CertificateChapterProps> = ({
    content,
    courseId,
    canEdit = true,
}) => {
    const router = useRouter()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId

    const [title, setTitle] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
    const [isUploaded, setIsUploaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alertOpen, setAlertOpen] = useState(!canEdit)
    const [originalTitle, setOriginalTitle] = useState('')
    const [uploadDisabled, setUploadDisabled] = useState(false)

    const { editChapter } = useEditChapter()
    const { getChapterDetails } = useGetChapterDetails()
    const { uploadCertificate, loading: certificateLoading } = useUploadCertificate()

    const fetchCertificateChapter = async () => {
        try {
            const response = await getChapterDetails({
                chapterId: content.id,
                bootcampId: courseId,
                moduleId: content.moduleId,
                topicId: content.topicId,
            })

            const chapterData = response?.data
            const titleValue = chapterData?.title || chapterData?.name || 'Untitled Certificate'
            const contentDetails = Array.isArray(chapterData?.contentDetails) ? chapterData.contentDetails[0] : null
            const uploadedUrl = contentDetails?.links?.[0] || chapterData?.certificateUrl || null

            setTitle(titleValue)
            setOriginalTitle(titleValue)
            setCertificateUrl(uploadedUrl)
            setIsUploaded(Boolean(uploadedUrl))
        } catch (error) {
            console.error('Error fetching certificate chapter:', error)
        }
    }

    useEffect(() => {
        if (content?.id) {
            fetchCertificateChapter()
        }
    }, [content?.id])

    const handleUpload = async () => {
        if (!canEdit) return

        if (!file) {
            if (title.trim() !== originalTitle.trim()) {
                try {
                    setLoading(true)
                    await editChapter(content.moduleId, content.id, { title })
                    setOriginalTitle(title)
                    toast.success({
                        title: 'Success',
                        description: 'Certificate title updated successfully',
                    })
                } catch (err: any) {
                    toast.error({
                        title: 'Update failed',
                        description: err.response?.data?.message || 'An error occurred.',
                    })
                } finally {
                    setLoading(false)
                }
                return
            }

            toast.info({
                title: 'No changes',
                description: 'There are no changes to save.',
            })
            return
        }

        if (file.type !== 'application/pdf') {
            toast.error({
                title: 'Invalid file type',
                description: 'Only PDF files are allowed.',
            })
            return
        }

        const formData = new FormData()
        formData.append('pdf', file, file.name)
        formData.append('title', title)

        try {
            setLoading(true)
            const res = await uploadCertificate(content.moduleId, content.id, formData, title)
            const uploadedUrl = res?.data?.certificateUrl || res?.data?.url || null

            if (uploadedUrl) {
                setCertificateUrl(uploadedUrl)
                setIsUploaded(true)
            }

            setFile(null)
            setUploadDisabled(false)
            setOriginalTitle(title)
            await fetchCertificateChapter()

            toast.success({
                title: 'Success',
                description: 'Certificate uploaded successfully!',
            })
        } catch (err: any) {
            toast.error({
                title: 'Upload failed',
                description: err.response?.data?.message || err.message || 'An error occurred.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!canEdit) return

        try {
            setLoading(true)
            await editChapter(content.moduleId, content.id, {
                title,
                links: null,
            })
            setCertificateUrl(null)
            setIsUploaded(false)
            toast.success({
                title: 'Success',
                description: 'Certificate deleted successfully',
            })
        } catch (err: any) {
            toast.error({
                title: 'Delete failed',
                description: err.response?.data?.message || 'An error occurred.',
            })
        } finally {
            setLoading(false)
        }
    }

    const isTitleChanged = title.trim() !== originalTitle.trim()

    return (
        <ScrollArea className="h-screen max-h-[calc(100vh-100px)]">
            <div className="max-w-4xl mx-auto py-6">
                {!canEdit && (
                    <PermissionAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} />
                )}

                <div className={canEdit ? '' : 'pointer-events-none opacity-60'}>
                    <div className="w-full space-y-5">
                        <div className="flex items-center gap-2 ml-1 pb-2">
                            <Award size={20} className="text-emerald-600" />
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.12em]">
                                Certificate
                            </p>
                        </div>

                        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">

                            <div className="p-5 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Certificate title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Untitled Certificate"
                                        className="text-base border focus-visible:ring-0"
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="rounded-lg border border-dashed border-emerald-200 bg-card p-2 dark:border-emerald-800 dark:bg-emerald-950/20">
                                    <UploadArticle
                                        loading={loading || certificateLoading}
                                        file={file}
                                        setFile={(newFile: any) => {
                                            setFile(newFile)
                                            setUploadDisabled(!!newFile)
                                        }}
                                        className=""
                                        isPdfUploaded={isUploaded}
                                        pdfLink={certificateUrl || ''}
                                        setIsPdfUploaded={setIsUploaded}
                                        onDeletePdfhandler={handleDelete}
                                        setDisableButton={setUploadDisabled}
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={handleUpload}
                                className=""
                                disabled={!canEdit || loading || certificateLoading || (!file && !isTitleChanged && !isUploaded)}
                            >
                                {loading || certificateLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

export default CertificateChapter
