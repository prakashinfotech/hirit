import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell, Edit2, Trash2, MapPin, Briefcase, Clock } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import JobAlertModal from '../../components/modals/JobAlertModal';
import { getJobAlerts, deleteJobAlert, toggleJobAlert } from '../../api/alerts';
import type { JobAlert } from '../../types';
import { cn, toTitleCase } from '../../lib/utils';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}

function ToggleSwitch({ checked, onChange, disabled, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? 'Toggle'}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2',
        checked ? 'bg-[#2563eb]' : 'bg-gray-200',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: JobAlert;
  onEdit: (alert: JobAlert) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  isTogglingId: string | null;
  isDeletingId: string | null;
}

function AlertCard({
  alert,
  onEdit,
  onDelete,
  onToggle,
  isTogglingId,
  isDeletingId,
}: AlertCardProps) {
  const isToggling = isTogglingId === alert.id;
  const isDeleting = isDeletingId === alert.id;

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white p-5 shadow-sm transition-opacity',
        !alert.is_active && 'opacity-60',
      )}
    >
      {/* Top row: name + toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#1a1a2e]">
            {alert.name}
          </p>
          {alert.keywords && (
            <p className="mt-0.5 truncate text-sm font-medium text-[#2563eb]">
              "{alert.keywords}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-medium', alert.is_active ? 'text-green-600' : 'text-gray-400')}>
            {alert.is_active ? 'Active' : 'Paused'}
          </span>
          {isToggling ? (
            <Spinner size="sm" />
          ) : (
            <ToggleSwitch
              checked={alert.is_active}
              onChange={(val) => onToggle(alert.id, val)}
              label={`Toggle alert ${alert.name}`}
            />
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap gap-3">
        {alert.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {alert.location}
          </span>
        )}
        {alert.job_type && (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <Briefcase className="h-3 w-3 shrink-0" />
            {toTitleCase(alert.job_type)}
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Clock className="h-3 w-3 shrink-0" />
          {alert.frequency === 'DAILY'
            ? 'Daily'
            : alert.frequency === 'WEEKLY'
            ? 'Weekly'
            : 'Instant'}
        </span>
      </div>

      {/* Bottom row: actions */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f5f5f5] pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(alert)}
            disabled={isDeleting || isToggling}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-xs font-medium text-[#1a1a2e] transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(alert.id)}
            disabled={isDeleting || isToggling}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Spinner size="sm" className="border-red-300 border-t-red-500" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobAlertsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: alerts = [], isLoading, isError } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: getJobAlerts,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleJobAlert(id, isActive),
    onMutate: ({ id }) => setTogglingId(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<JobAlert[]>(['job-alerts'], (prev = []) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      toast.success(updated.is_active ? 'Alert activated.' : 'Alert paused.');
    },
    onError: () => toast.error('Failed to update alert.'),
    onSettled: () => setTogglingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJobAlert(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<JobAlert[]>(['job-alerts'], (prev = []) =>
        prev.filter((a) => a.id !== id),
      );
      toast.success('Job alert deleted.');
    },
    onError: () => toast.error('Failed to delete alert.'),
    onSettled: () => setDeletingId(null),
  });

  const handleEdit = (alert: JobAlert) => {
    setEditingAlert(alert);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this job alert? You will stop receiving notifications for it.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingAlert(null);
    queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-center">
        <Bell className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">Failed to load alerts. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Job Alerts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Get notified when new jobs matching your criteria are posted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAlert(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Bell className="h-4 w-4" />
            Create New Alert
          </button>
        </div>

        {/* Alert count summary */}
        {alerts.length > 0 && (
          <p className="mb-4 text-sm text-gray-500">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''} —{' '}
            {alerts.filter((a) => a.is_active).length} active
          </p>
        )}

        {/* Empty state */}
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-10 w-10" />}
            title="No job alerts yet"
            description="Get notified when matching jobs are posted. Create your first alert to stay ahead of the market."
            actionLabel="Create Your First Alert"
            onAction={() => {
              setEditingAlert(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={(id, isActive) => toggleMutation.mutate({ id, isActive })}
                isTogglingId={togglingId}
                isDeletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal — create or edit */}
      <JobAlertModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        prefillKeyword={editingAlert?.keywords ?? ''}
        prefillLocation={editingAlert?.location ?? ''}
      />
    </>
  );
}
