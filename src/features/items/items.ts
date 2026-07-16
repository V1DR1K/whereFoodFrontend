import { api } from "../../lib/api";
import type { Item, Slice } from "../../types/domain";
export type ItemInput = {
  name: string;
  comment?: string;
  taste: number;
  price: number;
  visitDate: string;
};
export const getItems = (placeId: number, visitDate?: string) =>
  api<Slice<Item>>(
    `/items?placeId=${placeId}${visitDate ? `&visitDate=${visitDate}` : ""}`,
  );
export const getItemDates = (placeId: number) =>
  api<string[]>(`/places/${placeId}/item-dates`);
export const saveItem = (placeId: number, input: ItemInput, id?: number) =>
  api<Item>(id ? `/items/${id}` : `/places/${placeId}/items`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
export const uploadPhoto = (id: number, file: File) => {
  const data = new FormData();
  data.append("file", file);
  return api<Item>(`/items/${id}/photo`, { method: "POST", body: data });
};
export const deleteItem = (id: number) =>
  api<void>(`/items/${id}`, { method: "DELETE" });
