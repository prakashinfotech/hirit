import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Building2, FileText, Paperclip, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { applyToJob } from '../../api/applications';
import { uploadResume } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import type { Job } from '../../types';
import { cn } from '../../lib/utils';
import Spinner from '../ui/Spinner';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal dialog for submitting a job application.
 * Supports cover letter input and resume upload or reuse of existing resume.
 */
export default function ApplyModal({ job, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Use profile resume URL if the user already has one (seeker profile)
  const existingResumeUrl = (user as any)?.profile?.resume_url as string | undefined;
  const existingResumeFilename = (user as any)?.profile?.resume_filename as string | undefined;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5 MB.');
      e.target.value = '';
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let resumeUrl: string | undefined = existingResumeUrl;

      // Upload new resume if the user picked one
      if (resumeFile) {
        setUploading(true);
        const updatedProfile = await uploadResume(resumeFile);
        resumeUrl = updatedProfile.resume_url ?? undefined;
        setUploading(false);
      }

      await applyToJob(job.id, {
        cover_letter: coverLetter.trim() || undefined,
        resume_url: resumeUrl,
      });

      toast.success('Application submitted successfully!');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to submit application. Please try again.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setCoverLetter('');
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const isLoading = submitting || uploading;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-0 shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
          aria-describedby="apply-modal-desc"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#e0e0e0] px-6 py-5">
            <div>
              <Dialog.Title className="text-lg font-bold text-[#1a1a2e]">
                Apply for Job
              </Dialog.Title>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-[#1a1a2e]">{job.title}</span>
                <span>&nbsp;at</span>
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>{job.company?.name}</span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={isLoading}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-[#f5f5f5] hover:text-gray-600 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} id="apply-modal-desc">
            <div className="flex flex-col gap-5 px-6 py-5">
              {/* Cover letter */}
              <div>
                <label
                  htmlFor="cover-letter"
                  className="mb-1.5 block text-sm font-medium text-[#1a1a2e]"
                >
                  Cover Letter
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell the employer why you're a great fit for this role…"
                  className="w-full resize-none rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {coverLetter.length}/2000
                </p>
              </div>

              {/* Resume section */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-[#1a1a2e]">Resume / CV</p>

                {/* Already uploaded resume */}
                {existingResumeUrl && !resumeFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0 text-[#2563eb]" />
                      <span className="truncate text-sm text-[#1a1a2e]">
                        {existingResumeFilename ?? 'resume.pdf'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-3 shrink-0 text-xs font-medium text-[#2563eb] hover:underline"
                    >
                      Replace
                    </button>
                  </div>
                )}

                {/* New file chosen */}
                {resumeFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-[#2563eb]/30 bg-teal-50 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0 text-[#2563eb]" />
                      <span className="truncate text-sm text-[#1a1a2e]">{resumeFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-3 shrink-0 text-gray-400 hover:text-gray-600"
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                {!resumeFile && !existingResumeUrl && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e0e0e0] px-4 py-4 text-sm text-gray-500 transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Resume (PDF, max 5 MB)
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload resume PDF"
                />

                {!existingResumeUrl && !resumeFile && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    No resume on file. Upload a PDF to complete your application.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e0e0e0] px-6 py-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  className="rounded-md border border-[#e0e0e0] px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="border-white border-t-transparent" />
                    {uploading ? 'Uploading…' : 'Submitting…'}
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
