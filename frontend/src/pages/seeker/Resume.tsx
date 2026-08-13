import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CloudUpload,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { getProfile, uploadResume, deleteResume } from '../../api/users';
import { cn, formatDate } from '../../lib/utils';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ResumePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress(20);
      const result = await uploadResume(file);
      setUploadProgress(100);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Resume uploaded successfully!');
      setTimeout(() => setUploadProgress(null), 800);
    },
    onError: (err: any) => {
      setUploadProgress(null);
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to upload resume. Please try again.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Resume deleted.');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to delete resume.';
      toast.error(msg);
    },
  });

  const validateAndUpload = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File is too large. Maximum allowed size is 5 MB.');
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDeleteClick = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your resume? This cannot be undone.',
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const hasResume = Boolean(profile?.resume_url);
  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-gray-500">
          Failed to load profile. Please refresh and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">My Resume</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your resume so employers can review your qualifications.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload resume file"
      />

      {hasResume ? (
        /* ── Resume exists: show card ── */
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <FileText className="h-7 w-7 text-[#2563eb]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-[#1a1a2e]">
                {profile?.resume_filename ?? 'resume'}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>Uploaded on {formatDate(profile?.updated_at)}</span>
                {profile?.resume_filename && (
                  <span className="uppercase">
                    {profile.resume_filename.split('.').pop()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar shown while uploading a replacement */}
          {uploadProgress !== null && (
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-[#2563eb] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={profile?.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              <ExternalLink className="h-4 w-4" />
              View Resume
            </a>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" />
                  Uploading…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Replace Resume
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting || isUploading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="border-red-300 border-t-red-600" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Resume
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ── No resume: upload zone ── */
        <div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume — drag and drop or click to browse"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors',
              dragOver
                ? 'border-[#2563eb] bg-teal-50'
                : 'border-[#e0e0e0] bg-white hover:border-[#2563eb]/60 hover:bg-teal-50/30',
              isUploading && 'pointer-events-none opacity-70',
            )}
          >
            {isUploading ? (
              <Spinner size="lg" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <CloudUpload className="h-8 w-8 text-[#2563eb]" />
              </div>
            )}

            <div>
              <p className="text-base font-semibold text-[#1a1a2e]">
                {isUploading
                  ? 'Uploading your resume…'
                  : 'Drag & drop your resume or click to browse'}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Supports PDF, DOC, DOCX up to 5 MB
              </p>
            </div>

            {!isUploading && (
              <span className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90">
                Browse Files
              </span>
            )}
          </div>

          {/* Upload progress bar */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-[#2563eb] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="mb-2 text-sm font-semibold text-blue-800">Resume Tips</h3>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• Keep your resume to 1–2 pages for best results.</li>
          <li>• Use a clear font and consistent formatting throughout.</li>
          <li>• Tailor your resume to match the job description keywords.</li>
          <li>• Include measurable achievements, not just responsibilities.</li>
        </ul>
      </div>
    </div>
  );
}
