'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Award,
    Copy,
    RefreshCw,
    XCircle,
} from 'lucide-react'
import { getUser } from '@/store/store'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import EditModal from './components/editModal'
import DeleteModalDialog from './components/deleteModal'
import { ActionCellProps } from './studentComponentTypes'
import { toast } from '@/components/ui/use-toast'
import { useRevokeCertificate } from '@/app/[admin]/hooks/useRevokeCertificate'

const ActionCell: React.FC<ActionCellProps> = ({ student }) => {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId
    const { userId, bootcampId, name, email, status, batchId, certificateIssuedAt } = student

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [reissueDialogOpen, setReissueDialogOpen] = useState(false)
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
    const [revokeReason, setRevokeReason] = useState('')

    const { revokeCertificate, isRevoking } = useRevokeCertificate()

    const router = useRouter()

    const handleCopyCertificateLink = () => {
        setDropdownOpen(false)
        // TODO: replace with real certificate URL from backend
        const link = `${window.location.origin}/certificate/${bootcampId}/${userId}`
        navigator.clipboard
            .writeText(link)
            .then(() =>
                toast({ title: 'Link Copied', description: 'Certificate link copied to clipboard.' })
            )
            .catch(() =>
                toast({
                    title: 'Failed to copy',
                    description: 'Could not copy the link. Please try again.',
                    variant: 'destructive',
                })
            )
    }

    const handleReissue = () => {
        setReissueDialogOpen(false)
        // TODO: call reissue certificate API
        toast({ title: 'Certificate Reissued', description: `Certificate reissued for ${name}.` })
    }

    const handleRevokeDialogClose = (open: boolean) => {
        if (!open) {
            setRevokeDialogOpen(false)
            setRevokeReason('')
        }
    }

    const handleRevoke = async () => {
        await revokeCertificate(userId, bootcampId, revokeReason, {
            onSuccess: () => {
                setRevokeDialogOpen(false)
                setRevokeReason('')
            },
        })
    }

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary hover:text-white">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                    {/* ── Student actions ── */}
                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            router.push(`/${userRole}/organizations/${orgId}/courses/${bootcampId}/${userId}`)
                        }}
                        className="focus:text-blue-600"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            setEditModalOpen(true)
                        }}
                        className="focus:text-blue-600"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Student
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            setDeleteModalOpen(true)
                        }}
                        className="text-destructive focus:text-primary"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* ── Certificate actions ── */}
                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            // TODO: open certificate preview — backend integration pending
                            toast({ title: 'View Certificate', description: `Opening certificate for ${name}.` })
                        }}
                        className="focus:text-blue-600"
                    >
                        <Award className="mr-2 h-4 w-4" />
                        View Certificate
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleCopyCertificateLink}
                        className="focus:text-blue-600"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Certificate Link
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            setReissueDialogOpen(true)
                        }}
                        className="focus:text-blue-600"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reissue Certificate
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false)
                            setRevokeDialogOpen(true)
                        }}
                        className="focus:bg-destructive/10"
                    >
                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                        <span className="text-destructive flex-1">Revoke Certificate</span>
                        <Badge
                            variant="destructive"
                            className="ml-2 rounded px-1.5 py-0 text-[9px] font-bold tracking-wide"
                        >
                            CLICK
                        </Badge>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Modal */}
            <EditModal
                userId={Number(userId)}
                bootcampId={Number(bootcampId)}
                name={name}
                email={email}
                status={status}
                batchId={Number(batchId)}
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
            />

            {/* Delete Modal */}
            <DeleteModalDialog
                userId={[Number(userId)]}
                bootcampId={Number(bootcampId)}
                title="Delete Student"
                description={`Are you sure you want to delete ${name}? This action cannot be undone.`}
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            />

            {/* Reissue Confirmation */}
            <AlertDialog open={reissueDialogOpen} onOpenChange={setReissueDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reissue Certificate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reissue the certificate for{' '}
                            <strong>{name}</strong>? A new certificate will be generated and
                            the previous one will be replaced.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReissue}>Reissue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Revoke Certificate Dialog */}
            <Dialog open={revokeDialogOpen} onOpenChange={handleRevokeDialogClose}>
                <DialogContent
                    className="max-w-sm gap-0 p-6 [&>button]:hidden"
                    preventOutsideClose
                >
                    {/* Title — large, bold, left-aligned */}
                    <DialogTitle className="text-xl font-bold text-left mb-2">
                        Revoke certificate
                    </DialogTitle>

                    {/* Description — gray, left-aligned */}
                    <DialogDescription asChild>
                        <p className="text-sm text-muted-foreground leading-relaxed text-left mb-4">
                            <span className="text-foreground font-medium">{name}</span>
                            {"'s share "}
                            <span className="text-primary underline underline-offset-2 cursor-default">link</span>
                            {' will show this certificate as revoked, and they can '}
                            <span className="font-bold text-muted-foreground">no longer download it</span>
                            {'.'}
                        </p>
                    </DialogDescription>

                    {/* Reason label */}
                    <Label htmlFor="revoke-reason" className="text-sm font-medium text-left mb-1 block">
                        Reason
                    </Label>

                    {/* Textarea with "TYPE HERE" badge overlapping top-right border */}
                    <div className="relative mb-1">
                        <Textarea
                            id="revoke-reason"
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            placeholder="e.g. Issued by mistake"
                            className="min-h-[100px] resize-y border-primary focus-visible:ring-primary focus-visible:ring-1 rounded-md"
                            disabled={isRevoking}
                        />
                        {/* Badge sits on the top-right corner of the textarea border */}
                        <span className="pointer-events-none absolute -top-3 right-2 rounded-full bg-red-700 px-3 py-0.5 text-[10px] font-bold tracking-widest text-primary-foreground uppercase">
                            TYPE HERE
                        </span>
                    </div>

                    {/* Helper text — primary colored */}
                    <p className="text-xs text-primary mb-4">
                        Required. Saved with the certificate for audit.
                    </p>

                    {/* Footer — right-aligned */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleRevokeDialogClose(false)}
                            disabled={isRevoking}
                            className="rounded-lg px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRevoke}
                            disabled={isRevoking || !revokeReason.trim()}
                            className="rounded-lg px-5 bg-red-700 hover:bg-red-800 text-primary-foreground"
                        >
                            {isRevoking ? 'Revoking…' : 'Revoke'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ActionCell
