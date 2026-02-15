import api from './api';

export interface Message {
    id: number;
    content: string;
    category: string | null;
    created_at: string;
    likes_count: number;
    is_deleted?: boolean;
}

export interface MessagesResponse {
    status: string;
    data: Message[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export interface CreateMessagePayload {
    content: string;
    category?: string | null;
}

export async function getMessages(category?: string, page: number = 1): Promise<MessagesResponse> {
    const params: Record<string, string | number> = { page };
    if (category) params.category = category;
    const res = await api.get<MessagesResponse>('/messages', { params });
    return res.data;
}

export async function createMessage(payload: CreateMessagePayload): Promise<Message> {
    const res = await api.post<{ status: string; data: Message }>('/messages', payload);
    return res.data.data;
}

export async function likeMessage(id: number): Promise<number> {
    const res = await api.post<{ status: string; data: { likes_count: number } }>(
        `/messages/${id}/like`
    );
    return res.data.data.likes_count;
}
