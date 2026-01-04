import { decodeJwt } from '../lib/utils';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface StoredUser {
  id: number;
  username: string;
  email: string;
}

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): StoredUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

export const getCurrentUserId = (): number | null => {
  const token = getToken();
  if (token) {
    const payload = decodeJwt(token);
    if (payload?.sub && Number.isInteger(payload.sub)) {
      return payload.sub;
    }
  }
  const user = getUser();
  return user ? user.id : null;
};

export const setAuth = (token: string, user: StoredUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};
