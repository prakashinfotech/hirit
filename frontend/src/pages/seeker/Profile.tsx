import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Check, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProfile,
  updateProfile,
  updateSkills,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  uploadAvatar,
} from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import SkillTag from '../../components/ui/SkillTag';
import ProfileProgress from '../../components/ui/ProfileProgress';
import { getInitials } from '../../lib/utils';
import type { Education, Experience } from '../../types';

const personalSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  headline: z.string().optional(),
  phone: z.string().optional(),
  current_location: z.string().optional(),
  summary: z.string().optional(),
  linkedin_url: z.string().regex(/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b[-a-zA-Z0-9@:%_+.~#?&/=]*$/, 'Enter a valid URL').optional().or(z.literal('')),
  github_url: z.string().regex(/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b[-a-zA-Z0-9@:%_+.~#?&/=]*$/, 'Enter a valid URL').optional().or(z.literal('')),
});
type PersonalData = z.infer<typeof personalSchema>;

function calculateProgress(profile: any): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.headline) score += 10;
  if (profile.summary) score += 15;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.experiences && profile.experiences.length > 0) score += 25;
  if (profile.educations && profile.educations.length > 0) score += 15;
  if (profile.resume_url) score += 20;
  return score;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 2 * 60 * 1000,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refreshUser();
      setEditingPersonal(false);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const skillsMutation = useMutation({
    mutationFn: (skills: Array<{ name: string }>) => updateSkills(skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Skills updated!');
    },
    onError: () => toast.error('Failed to update skills.'),
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile photo updated!');
    },
    onError: () => toast.error('Failed to upload photo.'),
  });

  const addSkill = () => {
    const name = skillInput.trim();
    if (!name) return;
    if (profile?.skills?.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Skill already added.');
      return;
    }
    const current = profile?.skills?.map((s) => ({ name: s.name })) ?? [];
    skillsMutation.mutate([...current, { name }]);
    setSkillInput('');
  };

  const removeSkill = (skillName: string) => {
    const updated = (profile?.skills ?? [])
      .filter((s) => s.name !== skillName)
      .map((s) => ({ name: s.name }));
    skillsMutation.mutate(updated);
  };

  const handleEditPersonal = () => {
    reset({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      headline: profile?.headline ?? '',
      phone: user?.phone ?? '',
      current_location: profile?.current_location ?? '',
      summary: profile?.summary ?? '',
      linkedin_url: profile?.linkedin_url ?? '',
      github_url: profile?.github_url ?? '',
    });
    setEditingPersonal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB.'); return; }
    avatarMutation.mutate(file);
  };

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your profile updated to attract the best opportunities</p>
      </div>

      {/* Profile Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <ProfileProgress percentage={calculateProgress(profile)} />
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-bold text-[#1a1a2e] text-lg">Personal Information</h2>
          {!editingPersonal && (
            <button type="button" onClick={handleEditPersonal} className="flex items-center gap-1.5 text-sm text-[#2563eb] hover:underline font-medium">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <button
              type="button"
              className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-teal-200 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                getInitials(fullName)
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2563eb] rounded-full flex items-center justify-center text-white shadow"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-bold text-[#1a1a2e] text-lg">{fullName}</p>
            <p className="text-sm text-gray-500">{profile?.headline ?? user?.email}</p>
          </div>
        </div>

        {editingPersonal ? (
          <form
            onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register('first_name')} id="first_name" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
                {errors.first_name && <p className="text-xs text-red-500 mt-0.5">{errors.first_name.message}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register('last_name')} id="last_name" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
                {errors.last_name && <p className="text-xs text-red-500 mt-0.5">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
              <input {...register('headline')} id="headline" placeholder="e.g. Senior React Developer | 5 years experience" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} id="phone" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              </div>
              <div>
                <label htmlFor="current_location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input {...register('current_location')} id="current_location" placeholder="e.g. Bangalore, India" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              </div>
            </div>
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
              <textarea {...register('summary')} id="summary" rows={3} placeholder="Describe yourself..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input {...register('linkedin_url')} id="linkedin_url" placeholder="https://linkedin.com/in/..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
                {errors.linkedin_url && <p className="text-xs text-red-500 mt-0.5">{errors.linkedin_url.message}</p>}
              </div>
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input {...register('github_url')} id="github_url" placeholder="https://github.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
                {errors.github_url && <p className="text-xs text-red-500 mt-0.5">{errors.github_url.message}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="cursor-pointer flex items-center gap-1.5 bg-[#2563eb] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors disabled:opacity-60">
                <Check className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditingPersonal(false)} className="cursor-pointer flex items-center gap-1.5 border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Phone" value={user?.phone ?? profile?.user?.phone ?? '—'} />
            <InfoItem label="Location" value={profile?.current_location ?? '—'} />
            <InfoItem label="LinkedIn" value={profile?.linkedin_url} isLink />
            <InfoItem label="GitHub" value={profile?.github_url} isLink />
            {profile?.summary && (
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Summary</p>
                <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-[#1a1a2e] text-lg mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(profile?.skills ?? []).map((skill) => (
            <SkillTag
              key={skill.id}
              skill={skill.name}
              removable
              onRemove={() => removeSkill(skill.name)}
            />
          ))}
          {(profile?.skills ?? []).length === 0 && (
            <p className="text-sm text-gray-400">No skills added yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Type a skill and press Enter"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
          />
          <button type="button" onClick={addSkill} className="bg-[#2563eb] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Work Experience */}
      <ExperienceSection
        experiences={profile?.experiences ?? []}
        showForm={showExpForm}
        editingId={editingExpId}
        onShowForm={() => setShowExpForm(true)}
        onHideForm={() => { setShowExpForm(false); setEditingExpId(null); }}
        onSave={(data, id) => {
          const mutFn = id
            ? updateExperience(id, data).then(() => queryClient.invalidateQueries({ queryKey: ['profile'] }))
            : addExperience(data).then(() => queryClient.invalidateQueries({ queryKey: ['profile'] }));
          mutFn.then(() => { setShowExpForm(false); setEditingExpId(null); toast.success('Experience saved!'); })
               .catch(() => toast.error('Failed to save experience.'));
        }}
        onDelete={(id) => {
          deleteExperience(id)
            .then(() => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast.success('Experience deleted.'); })
            .catch(() => toast.error('Failed to delete.'));
        }}
        onEdit={(id) => { setEditingExpId(id); setShowExpForm(true); }}
      />

      {/* Education */}
      <EducationSection
        educations={profile?.educations ?? []}
        showForm={showEduForm}
        editingId={editingEduId}
        onShowForm={() => setShowEduForm(true)}
        onHideForm={() => { setShowEduForm(false); setEditingEduId(null); }}
        onSave={(data, id) => {
          const mutFn = id
            ? updateEducation(id, data).then(() => queryClient.invalidateQueries({ queryKey: ['profile'] }))
            : addEducation(data).then(() => queryClient.invalidateQueries({ queryKey: ['profile'] }));
          mutFn.then(() => { setShowEduForm(false); setEditingEduId(null); toast.success('Education saved!'); })
               .catch(() => toast.error('Failed to save education.'));
        }}
        onDelete={(id) => {
          deleteEducation(id)
            .then(() => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast.success('Education deleted.'); })
            .catch(() => toast.error('Failed to delete.'));
        }}
        onEdit={(id) => { setEditingEduId(id); setShowEduForm(true); }}
      />
    </div>
  );
}

function InfoItem({ label, value, isLink }: Readonly<{ label: string; value?: string | null; isLink?: boolean }>) {
  return (
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline truncate block">
          {value}
        </a>
      ) : (
        <p className="text-gray-800 truncate">{value ?? '—'}</p>
      )}
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ExperienceSection({ experiences, showForm, editingId, onShowForm, onHideForm, onSave, onDelete, onEdit }: Readonly<{
  experiences: readonly Experience[];
  showForm: boolean;
  editingId: string | null;
  onShowForm: () => void;
  onHideForm: () => void;
  onSave: (data: any, id?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}>) {
  const editing = editingId ? experiences.find((e) => e.id === editingId) : undefined;
  const [form, setForm] = useState({
    company_name: editing?.company_name ?? '',
    job_title: editing?.job_title ?? '',
    location: editing?.location ?? '',
    start_date: editing?.start_date ?? '',
    end_date: editing?.end_date ?? '',
    is_current: editing?.is_current ?? false,
    description: editing?.description ?? '',
  });

  useEffect(() => {
    if (showForm) {
      setForm({
        company_name: editing?.company_name ?? '',
        job_title: editing?.job_title ?? '',
        location: editing?.location ?? '',
        start_date: editing?.start_date ?? '',
        end_date: editing?.end_date ?? '',
        is_current: editing?.is_current ?? false,
        description: editing?.description ?? '',
      });
    } else {
      setForm({ company_name: '', job_title: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
    }
  }, [showForm, editing]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[#1a1a2e] text-lg">Work Experience</h2>
        <button type="button" onClick={onShowForm} className="flex items-center gap-1.5 text-sm text-[#2563eb] hover:underline font-medium">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border border-teal-200 bg-teal-50 rounded-xl p-4 mb-5">
          <h3 className="font-semibold text-[#1a1a2e] mb-3 text-sm">{editingId ? 'Edit' : 'Add'} Experience</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Job Title *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company Name *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            </div>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              {!form.is_current && (
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} className="accent-[#2563eb]" />{' '}
              Currently working here
            </label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your role and achievements..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] resize-none" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => onSave(form, editingId ?? undefined)} className="cursor-pointer bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">Save</button>
            <button type="button" onClick={onHideForm} className="cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {experiences.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 text-center py-4">No experience added yet.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {getInitials(exp.company_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">{exp.job_title}</p>
                    <p className="text-gray-600 text-xs">{exp.company_name}{exp.location && ` · ${exp.location}`}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {exp.start_date} — {exp.is_current ? 'Present' : (exp.end_date ?? '—')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button type="button" onClick={() => onEdit(exp.id)} className="text-gray-400 hover:text-[#2563eb]"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => onDelete(exp.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {exp.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationSection({ educations, showForm, editingId, onShowForm, onHideForm, onSave, onDelete, onEdit }: Readonly<{
  educations: readonly Education[];
  showForm: boolean;
  editingId: string | null;
  onShowForm: () => void;
  onHideForm: () => void;
  onSave: (data: any, id?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}>) {
  const editing = editingId ? educations.find((e) => e.id === editingId) : undefined;
  const [form, setForm] = useState({
    institution: editing?.institution ?? '',
    degree: editing?.degree ?? '',
    field_of_study: editing?.field_of_study ?? '',
    start_year: editing?.start_year ?? new Date().getFullYear() - 4,
    end_year: editing?.end_year ?? new Date().getFullYear(),
    is_current: editing?.is_current ?? false,
    grade: editing?.grade ?? '',
  });

  useEffect(() => {
    if (showForm) {
      setForm({
        institution: editing?.institution ?? '',
        degree: editing?.degree ?? '',
        field_of_study: editing?.field_of_study ?? '',
        start_year: editing?.start_year ?? new Date().getFullYear() - 4,
        end_year: editing?.end_year ?? new Date().getFullYear(),
        is_current: editing?.is_current ?? false,
        grade: editing?.grade ?? '',
      });
    } else {
      setForm({ institution: '', degree: '', field_of_study: '', start_year: new Date().getFullYear() - 4, end_year: new Date().getFullYear(), is_current: false, grade: '' });
    }
  }, [showForm, editing]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[#1a1a2e] text-lg">Education</h2>
        <button type="button" onClick={onShowForm} className="flex items-center gap-1.5 text-sm text-[#2563eb] hover:underline font-medium">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border border-teal-200 bg-teal-50 rounded-xl p-4 mb-5">
          <h3 className="font-semibold text-[#1a1a2e] mb-3 text-sm">{editingId ? 'Edit' : 'Add'} Education</h3>
          <div className="space-y-3">
            <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="University / Institution *" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree (e.g. B.Tech)" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              <input value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} placeholder="Field of Study" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })} placeholder="Start Year" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              {!form.is_current && (
                <input type="number" value={form.end_year ?? ''} onChange={(e) => setForm({ ...form, end_year: Number(e.target.value) })} placeholder="End Year" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
              )}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} className="accent-[#2563eb]" />{' '}
                Currently studying
              </label>
              <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Grade / CGPA (optional)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => onSave(form, editingId ?? undefined)} className="cursor-pointer bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">Save</button>
            <button type="button" onClick={onHideForm} className="cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {educations.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 text-center py-4">No education added yet.</p>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div key={edu.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {edu.degree?.charAt(0) ?? 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">{edu.degree} in {edu.field_of_study}</p>
                    <p className="text-gray-600 text-xs">{edu.institution}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {edu.start_year} — {edu.is_current ? 'Present' : (edu.end_year ?? '—')}
                      {edu.grade && ` · ${edu.grade}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button type="button" onClick={() => onEdit(edu.id)} className="text-gray-400 hover:text-[#2563eb]"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => onDelete(edu.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
