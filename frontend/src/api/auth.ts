import apiClient, { tokenStorage } from './client';
import type { AuthResponse, RegisterData, User } from '../types';

const BASE = '/api/auth';
const MOCK_USER_KEY = 'hirit_demo_user';

// Maps backend user/profile shape → frontend User type
function normalizeUser(raw: any): User {
  const fullName: string = raw.full_name ?? '';
  const spaceIdx = fullName.indexOf(' ');
  const first_name = raw.first_name ?? (spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName);
  const last_name = raw.last_name ?? (spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : '');
  return {
    id: raw.id,
    email: raw.email ?? '',
    role: ((raw.role ?? 'seeker').toUpperCase()) as User['role'],
    first_name,
    last_name,
    phone: raw.phone,
    avatar_url: raw.avatar_url ?? raw.profile_photo_url,
    is_active: raw.is_active ?? true,
    is_verified: raw.is_verified ?? true,
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
  };
}

function adaptTokenResponse(data: any): AuthResponse {
  const token: string = data.access_token ?? data.access ?? '';
  tokenStorage.setTokens(token, '');
  const user = normalizeUser(data.user ?? data);
  return { user, tokens: { access: token, refresh: '' } };
}

function mockAuth(email: string, role: string, fullName?: string): AuthResponse {
  const spaceIdx = (fullName ?? '').indexOf(' ');
  const first_name = fullName
    ? (spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName)
    : email.split('@')[0];
  const last_name = fullName && spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : '';

  const user: User = {
    id: 'demo-' + email.replace(/[^a-z0-9]/gi, ''),
    email,
    role: (role.toUpperCase()) as User['role'],
    first_name,
    last_name,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  const fakeToken = 'demo.' + btoa(JSON.stringify({ sub: user.id, email, role }));
  tokenStorage.setTokens(fakeToken, '');
  return { user, tokens: { access: fakeToken, refresh: '' } };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<any>(`${BASE}/login`, { email, password });
    return adaptTokenResponse(data);
  } catch (err: any) {
    const httpStatus = err?.status_code ?? err?.response?.status;
    // Re-throw auth errors so the UI can show them
    if (httpStatus === 401 || httpStatus === 400 || httpStatus === 422) throw err;
    // Only fall back to demo mode on network/server errors
    const stored = localStorage.getItem(MOCK_USER_KEY);
    if (stored) {
      const mockUser = JSON.parse(stored) as User;
      if (mockUser.email === email) {
        const fakeToken = 'demo.' + btoa(JSON.stringify({ sub: mockUser.id, email, role: mockUser.role }));
        tokenStorage.setTokens(fakeToken, '');
        return { user: mockUser, tokens: { access: fakeToken, refresh: '' } };
      }
    }
    return mockAuth(email, 'seeker');
  }
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim();
  const payload = {
    email: userData.email,
    password: userData.password,
    full_name: fullName,
    phone: userData.phone,
    role: userData.role.toLowerCase(),
  };
  try {
    const { data } = await apiClient.post<any>(`${BASE}/register`, payload);
    return adaptTokenResponse(data);
  } catch {
    return mockAuth(userData.email, userData.role.toLowerCase(), fullName);
  }
}

export async function logout(): Promise<void> {
  try {
    const token = tokenStorage.getAccess();
    if (!token?.startsWith('demo.')) {
      await apiClient.post(`${BASE}/logout`);
    }
  } finally {
    localStorage.removeItem(MOCK_USER_KEY);
    tokenStorage.clear();
  }
}

export async function getMe(): Promise<User> {
  const token = tokenStorage.getAccess();
  if (token?.startsWith('demo.')) {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    if (stored) return JSON.parse(stored) as User;
    tokenStorage.clear();
    throw new Error('Demo session expired');
  }
  const { data } = await apiClient.get<any>(`${BASE}/me`);
  return normalizeUser(data);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post(`${BASE}/forgot-password`, { email });
}
