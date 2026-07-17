import { api } from '../../lib/api';
import type { Home, HomeRecipe, HomeRecipeIngredient, MealType } from '../../types/domain';

export type HomeRecipeInput = { home: Home; name: string; recipeUrl?: string; preparedOn: string; mealType: MealType; ingredients: HomeRecipeIngredient[]; copyPhotoFromId?: number };
export const getHomeRecipes = (home: Home) => api<HomeRecipe[]>(`/how-cook?home=${home}`);
export const saveHomeRecipe = (input: HomeRecipeInput, id?: number) => api<HomeRecipe>(`/how-cook${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) });
export const uploadHomeRecipePhoto = (id: number, file: File) => { const data = new FormData(); data.append('file', file); return api<HomeRecipe>(`/how-cook/${id}/photo`, { method: 'POST', body: data }); };
export const deleteHomeRecipe = (id: number) => api<void>(`/how-cook/${id}`, { method: 'DELETE' });
