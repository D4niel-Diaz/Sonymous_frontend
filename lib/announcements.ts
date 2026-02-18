import api from './api';

export interface Announcement {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
    const res = await api.get<Announcement[]>('/public-announcements');
    return res.data;
}
