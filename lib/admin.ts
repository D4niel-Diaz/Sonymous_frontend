import api from './api';
import type { Message } from './messages';

export interface AdminProfile {
    id: number;
    name: string;
    email: string;
}

export interface LoginResponse {
    status: string;
    data: {
        token: string;
        admin: AdminProfile;
    };
}

export interface AdminMessagesResponse {
    status: string;
    data: Message[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse['data']> {
    const res = await api.post<LoginResponse>('/admin/login', { email, password });
    return res.data.data;
}

export async function getAdminMessages(params?: {
    category?: string;
    is_deleted?: string;
    page?: number;
}): Promise<AdminMessagesResponse> {
    const res = await api.get<AdminMessagesResponse>('/admin/messages', { params });
    return res.data;
}

export async function deleteMessage(id: number): Promise<void> {
    await api.delete(`/admin/messages/${id}`);
}
