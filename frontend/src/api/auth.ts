import { http } from './http';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export const registerUser = async (payload: {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
  const { data } = await http.post('/chat/register', payload);
  return data;
};

export const loginUser = async (payload: { login: string; password: string }): Promise<LoginResponse> => {
  const { data } = await http.post('/chat/login', payload);
  return data;
};
