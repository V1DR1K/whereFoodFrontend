import { api } from '../../lib/api';
import type { FunCategory, FunPlan, FunReview, Slice } from '../../types/domain';

export type FunCategoryInput = { parentId?: number; name: string; icon: string; active: boolean };
export type FunPlanInput = { name: string; address: string; scheduledAt: string; categoryId: number; subcategoryId: number };

export const getFunCategories = () => api<FunCategory[]>('/why-fun/categories');
export const getAllFunCategories = () => api<FunCategory[]>('/why-fun/categories/all');
export const saveFunCategory = (input: FunCategoryInput, id?: number) => api<FunCategory>(`/why-fun/categories${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) });
export const getFunPlans = (filters: { categoryId?: number; subcategoryId?: number; timeline?: 'UPCOMING' | 'PAST' | 'UNSCHEDULED'; cursor?: number } = {}) => {
 const query = new URLSearchParams({ size: '12' });
 if (filters.categoryId) query.set('categoryId', String(filters.categoryId));
 if (filters.subcategoryId) query.set('subcategoryId', String(filters.subcategoryId));
 if (filters.timeline) query.set('timeline', filters.timeline);
 if (filters.cursor) query.set('cursor', String(filters.cursor));
 return api<Slice<FunPlan>>(`/why-fun/plans?${query}`);
};
export const getFunPlan = (id: number) => api<FunPlan>(`/why-fun/plans/${id}`);
export const saveFunPlan = (input: FunPlanInput, id?: number) => api<FunPlan>(`/why-fun/plans${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) });
export const deleteFunPlan = (id: number) => api<void>(`/why-fun/plans/${id}`, { method: 'DELETE' });
export const uploadFunPhoto = (id: number, file: File) => { const data = new FormData(); data.append('file', file); return api<FunPlan>(`/why-fun/plans/${id}/photos`, { method: 'POST', body: data }); };
export const setFunCover = (planId: number, photoId: number) => api<FunPlan>(`/why-fun/plans/${planId}/cover/${photoId}`, { method: 'PUT' });
export const deleteFunPhoto = (id: number) => api<void>(`/why-fun/photos/${id}`, { method: 'DELETE' });
export const saveFunReview = (id: number, input: Pick<FunReview, 'rating' | 'comment'>) => api<FunReview>(`/why-fun/plans/${id}/review`, { method: 'PUT', body: JSON.stringify(input) });
