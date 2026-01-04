import { api1Http, api2Http } from './http';

export interface Api1User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Api1Message {
  id: number;
  discussionId: string;
  userId: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Api2Discussion {
  id: string;
  title: string;
  userIds: number[];
  createdAt: string;
  updatedAt: string;
}

export const api1 = {
  listUsers: async () => {
    const { data } = await api1Http.get<{ data: Api1User[] }>('/users');
    return data;
  },
  createUser: async (payload: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => {
    const { data } = await api1Http.post('/users', payload);
    return data;
  },
  updateUser: async (id: number, payload: { username?: string; email?: string; password?: string }) => {
    const { data } = await api1Http.put(`/users/${id}`, payload);
    return data;
  },
  deleteUser: async (id: number) => {
    const { data } = await api1Http.delete(`/users/${id}`);
    return data;
  },
  listMessages: async (params?: {
    discussionId?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }) => {
    const { data } = await api1Http.get<{ data: Api1Message[] }>('/messages', { params });
    return data;
  },
  createMessage: async (payload: { discussionId: string; content: string }) => {
    const { data } = await api1Http.post('/messages', payload);
    return data;
  },
  updateMessage: async (id: number, payload: { content: string }) => {
    const { data } = await api1Http.put(`/messages/${id}`, payload);
    return data;
  },
  deleteMessage: async (id: number) => {
    const { data } = await api1Http.delete(`/messages/${id}`);
    return data;
  },
};

export const api2 = {
  listDiscussions: async (params?: { userId?: number; limit?: number; offset?: number }) => {
    const { data } = await api2Http.get<{ data: Api2Discussion[] }>('/discussions', { params });
    return data;
  },
  createDiscussion: async (payload: { title: string; userIds: number[] }) => {
    const { data } = await api2Http.post('/discussions', payload);
    return data;
  },
  updateDiscussion: async (id: string, payload: { title?: string; userIds?: number[] }) => {
    const { data } = await api2Http.put(`/discussions/${id}`, payload);
    return data;
  },
  deleteDiscussion: async (id: string) => {
    const { data } = await api2Http.delete(`/discussions/${id}`);
    return data;
  },
};
