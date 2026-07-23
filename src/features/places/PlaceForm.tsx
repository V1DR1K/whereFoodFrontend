import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "../categories/categories";
import { getHighlightTags } from "./highlightTags";
import { savePlace } from "./places";
import { Modal } from "../../components/ui/Modal";
import { showNotice } from "../../lib/flash";
import type { Place } from "../../types/domain";

const mapsSearch = (address: string) => address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;
export function PlaceForm({ onClose, place, onSaved }: { onClose: () => void; place?: Place; onSaved?: (place: Place) => void }) {
  const [categoryId, setCategoryId] = useState(() => place?.category.id ? String(place.category.id) : "");
  const [tagIds, setTagIds] = useState<number[]>(() => place?.tags.map(tag => tag.id) ?? []);
  const qc = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const tagsQuery = useQuery({ queryKey: ["highlight-tags"], queryFn: getHighlightTags });
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const address = String(form.get("address")).trim();
      const input = { name: String(form.get("name")).trim(), address: address || undefined, sourceUrl: String(form.get("sourceUrl")) || undefined, mapsUrl: mapsSearch(address), categoryId: Number(form.get("categoryId")), tagIds };
      return savePlace(input, place?.id);
    },
    onSuccess: async saved => {
      await Promise.all([qc.invalidateQueries({ queryKey: ["places"] }), qc.invalidateQueries({ queryKey: ["place", saved.id] })]);
      showNotice(place ? "Actualizamos el lugar compartido." : "Lugar agregado. Ahora pueden registrar la primera visita.");
      onSaved?.(saved);
      onClose();
    },
  });
  const pending = mutation.isPending;
  return <Modal onClose={onClose} confirmDiscard pending={pending}><form onSubmit={event => { event.preventDefault(); mutation.mutate(new FormData(event.currentTarget)); }}><p className="eyebrow">{place ? "EDITAR LUGAR" : "NUEVO LUGAR"}</p><h2>{place ? "Ajustemos el lugar" : "¿A dónde quieren ir?"}</h2>
    <label>Nombre<input name="name" defaultValue={place?.name} required autoFocus /></label>
    <label>Dirección <small className="tiny">Opcional</small><input name="address" defaultValue={place?.address} placeholder="Calle 123, Rosario" /></label>
    <label>URL de referencia <small className="tiny">Opcional</small><input name="sourceUrl" type="url" defaultValue={place?.sourceUrl} placeholder="https://instagram.com/reel/..." /></label>
    <label>Tipo<select name="categoryId" value={categoryId} onChange={event => setCategoryId(event.target.value)} required><option value="">Elegí una categoría</option>{categoriesQuery.data?.map(category => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label>
    <fieldset className="tag-picker"><legend>¿Por qué se destaca?</legend><p>Elegí todas las etiquetas que correspondan.</p><div className="tag-options">{tagsQuery.data?.map(tag => <label className="tag-option" key={tag.id}><input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => setTagIds(current => current.includes(tag.id) ? current.filter(id => id !== tag.id) : [...current, tag.id])} /><span>{tag.emoji} {tag.name}</span></label>)}</div></fieldset>
  <button className="main-button" disabled={pending}>{mutation.isPending ? "Guardando…" : place ? "✓ Guardar lugar" : "＋ Agregar lugar"}</button>
  {mutation.error && <p className="form-error">{mutation.error.message}</p>}
  </form></Modal>;
}
