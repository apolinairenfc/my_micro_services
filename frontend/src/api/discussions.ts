import { http } from './http';

export interface Discussion {
  id: string;
  title: string;
  userIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  discussionId: string;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionsResponse {
  data: Discussion[];
  meta?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface DiscussionDetailResponse {
  data: {
    discussion: Discussion;
    messages: Message[];
  };
}

export const fetchDiscussions = async (params?: { userId?: number; limit?: number; offset?: number }) => {
  const { data } = await http.get<DiscussionsResponse>('/chat/discussions', {
    params,
  });
  return data;
};

export const createDiscussion = async (payload: { title: string; userIds: number[] }) => {
  const { data } = await http.post('/chat/discussions', payload);
  return data;
};

export const fetchDiscussionDetail = async (id: string) => {
  const { data } = await http.get<DiscussionDetailResponse>(`/chat/discussions/${id}`);
  return data;
};

export const createMessage = async (discussionId: string, payload: { content: string }) => {
  const { data } = await http.post(`/chat/discussions/${discussionId}/messages`, payload);
  return data;
};
