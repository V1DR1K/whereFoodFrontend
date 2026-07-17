import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { StarRating } from '../../components/ui/StarRating';
import { session } from '../../lib/api';
import type { FunSchedule, FunVenue, FunWeekday } from '../../types/domain';
import { getAllFunCategories, saveFunReview, saveFunVenue, uploadFunPhoto } from './whyFun';

const days: { value: FunWeekday; label: string }[] = [
 { value: 'MONDAY', label: 'Lunes' }, { value: 'TUESDAY', label: 'Martes' }, { value: 'WEDNESDAY', label: 'Miércoles' }, { value: 'THURSDAY', label: 'Jueves' }, { value: 'FRIDAY', label: 'Viernes' }, { value: 'SATURDAY', label: 'Sábado' }, { value: 'SUNDAY', label: 'Domingo' },
];

export function FunVenueForm({ venue, reviewOnly = false, onClose }: { venue?: FunVenue; reviewOnly?: boolean; onClose: () => void }) {
 const qc = useQueryClient();
 const username = session.get()?.username;
 const ownReview = venue?.reviews.find(review => review.author === username);
 const canEditDetails = !venue || venue.author === username;
 const [categoryId, setCategoryId] = useState<number | undefined>(venue?.category.id);
 const [subcategoryId, setSubcategoryId] = useState<number | undefined>(venue?.subcategory.id);
 const [schedules, setSchedules] = useState<FunSchedule[]>(venue?.schedules ?? []);
 const [files, setFiles] = useState<File[]>([]);
 const [rating, setRating] = useState(ownReview?.rating ?? 4);
 const [comment, setComment] = useState(ownReview?.comment ?? '');
 const [clientError, setClientError] = useState<string>();
 const categories = useQuery({ queryKey: ['fun-categories', 'all'], queryFn: getAllFunCategories, enabled: !reviewOnly && canEditDetails });
 const roots = (categories.data ?? []).filter(category => !category.parentId && (category.active || category.id === categoryId));
 const subcategories = (categories.data ?? []).filter(category => category.parentId === categoryId && (category.active || category.id === subcategoryId));
 const mutation = useMutation({
  mutationFn: async (details: { name: string; address: string }) => {
   if (reviewOnly) {
    if (!venue) throw new Error('No encontramos el lugar para reseñar');
    return saveFunReview(venue.id, { rating, comment: comment.trim() || undefined });
   }
   if (!canEditDetails || !categoryId || !subcategoryId) throw new Error('Elegí una categoría y una subcategoría');
   if (!schedules.length) throw new Error('Agregá al menos un horario de apertura');
   if (schedules.some(schedule => schedule.opensAt >= schedule.closesAt)) throw new Error('Cada horario debe cerrar después de abrir');
   const duplicateOrOverlap = schedules.some((schedule, index) => schedules.some((other, otherIndex) => schedule.day === other.day && index !== otherIndex && schedule.opensAt < other.closesAt && other.opensAt < schedule.closesAt));
   if (duplicateOrOverlap) throw new Error('Los horarios de un mismo día no pueden superponerse');
   if ((venue?.photos.length ?? 0) + files.length > 12) throw new Error('Cada lugar admite hasta 12 fotos');
   const input = { name: details.name.trim(), address: details.address.trim(), categoryId, subcategoryId, schedules };
   if (!input.name || !input.address) throw new Error('Completá el nombre y la dirección');
   const saved = await saveFunVenue(input, venue?.id);
   for (const file of files) await uploadFunPhoto(saved.id, file);
   return saved;
  },
  onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['fun-venues'] }), qc.invalidateQueries({ queryKey: ['fun-venue', venue?.id] })]); onClose(); },
 });
 const addSchedule = (day: FunWeekday) => setSchedules(current => [...current, { day, opensAt: '10:00', closesAt: '18:00' }]);
 const updateSchedule = (index: number, value: Partial<FunSchedule>) => setSchedules(current => current.map((schedule, position) => position === index ? { ...schedule, ...value } : schedule));
 const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); setClientError(undefined); mutation.mutate({ name: String(form.get('name') ?? ''), address: String(form.get('address') ?? '') }); };

 if (reviewOnly) return <Modal onClose={onClose}><form className="fun-review-form" onSubmit={submit}><p className="eyebrow">TU OPINIÓN</p><h2>{ownReview ? 'Actualizá tu experiencia' : '¿Cómo la pasaste?'}</h2><label>Tu puntuación<StarRating label="Puntuación del lugar" value={rating} onChange={setRating} /></label><label>Reseña <small className="tiny">Opcional</small><textarea value={comment} maxLength={1000} onChange={event => setComment(event.target.value)} placeholder="Contá qué hicieron y qué les gustó…" /></label><button className="main-button" disabled={mutation.isPending}>{mutation.isPending ? 'Guardando…' : 'Guardar opinión'} ✦</button>{(clientError || mutation.error) && <p className="form-error">{clientError ?? mutation.error?.message}</p>}</form></Modal>;

 return <Modal onClose={onClose}><form className="fun-venue-form" onSubmit={submit}><p className="eyebrow">{venue ? 'EDITAR SALIDA' : 'NUEVO PLAN'}</p><h2>{venue ? 'Ajustemos los datos' : '¿Qué quieren hacer?'}</h2><label>Nombre<input name="name" defaultValue={venue?.name} placeholder="Ej. Bowling del centro" required autoFocus /></label><label>Dirección<input name="address" defaultValue={venue?.address} placeholder="Calle 123, Rosario" required /></label><div className="form-columns"><label>Categoría<select value={categoryId ?? ''} onChange={event => { setCategoryId(Number(event.target.value) || undefined); setSubcategoryId(undefined); }} required><option value="">Elegí una categoría</option>{roots.map(category => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label><label>Subcategoría<select value={subcategoryId ?? ''} onChange={event => setSubcategoryId(Number(event.target.value) || undefined)} disabled={!categoryId} required><option value="">Elegí una subcategoría</option>{subcategories.map(category => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label></div><fieldset className="fun-schedule-fields"><legend>Horarios</legend><p>Agregá una o más franjas para cada día. Los días sin franjas se muestran como cerrados.</p>{days.map(day => { const daySchedules = schedules.map((schedule, index) => ({ schedule, index })).filter(value => value.schedule.day === day.value); return <div className="fun-schedule-day" key={day.value}><strong>{day.label}</strong><div>{daySchedules.length ? daySchedules.map(({ schedule, index }) => <span className="fun-time-range" key={index}><input aria-label={`Apertura ${day.label}`} type="time" value={schedule.opensAt} onChange={event => updateSchedule(index, { opensAt: event.target.value })} required /><b>a</b><input aria-label={`Cierre ${day.label}`} type="time" value={schedule.closesAt} onChange={event => updateSchedule(index, { closesAt: event.target.value })} required /><button className="text-button" type="button" onClick={() => setSchedules(current => current.filter((_, position) => position !== index))}>Quitar</button></span>) : <small>Cerrado</small>}<button className="text-button" type="button" onClick={() => addSchedule(day.value)}>+ Franja</button></div></div>; })}</fieldset><label>Fotos <small className="tiny">Hasta 12 en total</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => setFiles(Array.from(event.target.files ?? []))} /></label>{venue?.photos.length ? <small className="tiny">Las fotos actuales se mantienen; podés sumar nuevas.</small> : null}<button className="main-button" disabled={mutation.isPending}>{mutation.isPending ? 'Guardando…' : venue ? 'Guardar cambios' : 'Agendar salida'} ✦</button>{(clientError || mutation.error) && <p className="form-error">{clientError ?? mutation.error?.message}</p>}</form></Modal>;
}
