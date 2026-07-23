import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/ui/Modal";
import { StarRating } from "../../components/ui/StarRating";
import type { PlaceVisit, PlaceVisitReview } from "../../types/domain";
import { createVisitReview, deleteVisitReview, updateVisitReview, type PlaceVisitReviewInput } from "./items";
import { showNotice } from "../../lib/flash";

const venueMetrics = [["location", "Ubicación"], ["heating", "Calefacción"], ["bathrooms", "Baños"], ["exterior", "Exterior"], ["seating", "Asientos"], ["service", "Atención"], ["ambiance", "Ambiente"]] as const;
type Metric = keyof Pick<PlaceVisitReview, "location" | "heating" | "bathrooms" | "exterior" | "seating" | "service" | "ambiance">;

export function VisitReviewForm({ placeId, visit, review, onClose }: { placeId: number; visit: PlaceVisit; review?: PlaceVisitReview; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [overall, setOverall] = useState(review?.overall ?? 4);
  const [taste, setTaste] = useState<number | undefined>(review?.taste);
  const [price, setPrice] = useState<number | undefined>(review?.price);
  const [metrics, setMetrics] = useState<Record<Metric, number | undefined>>(() => Object.fromEntries(venueMetrics.map(([key]) => [key, review?.[key as Metric]])) as Record<Metric, number | undefined>);
  const invalidate = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["visit", visit.id] }), queryClient.invalidateQueries({ queryKey: ["visits", placeId] }), queryClient.invalidateQueries({ queryKey: ["place", placeId] }), queryClient.invalidateQueries({ queryKey: ["places"] })]);
  const mutation = useMutation({ mutationFn: (form: FormData) => { const input: PlaceVisitReviewInput = { overall, comment: String(form.get("comment")).trim() || undefined, taste, price, ...metrics }; return review ? updateVisitReview(review.id, input) : createVisitReview(visit.id, input); }, onSuccess: async () => { await invalidate(); showNotice(review ? "Actualizamos la reseña compartida." : "Agregamos la reseña a esta visita."); onClose(); } });
  const remove = useMutation({ mutationFn: () => deleteVisitReview(review!.id), onSuccess: async () => { await invalidate(); showNotice("Eliminamos la reseña."); onClose(); } });
  const score = (label: string, value: number | undefined, setValue: (value: number | undefined) => void, optional = false) => <label className="score-field">{label}<span className="place-score-input"><StarRating label={label} value={value} onChange={setValue} />{optional && value !== undefined && <button className="text-button" type="button" onClick={() => setValue(undefined)}>Quitar</button>}</span></label>;
  return <Modal onClose={onClose} confirmDiscard pending={mutation.isPending || remove.isPending}><form onSubmit={(event) => { event.preventDefault(); mutation.mutate(new FormData(event.currentTarget)); }}><p className="eyebrow">RESEÑA DE LA VISITA</p><h2>¿Cómo estuvo?</h2><p className="muted">La puntuación general es obligatoria. Los demás aspectos son opcionales.</p>{score("Puntuación general", overall, (value) => { if (value !== undefined) setOverall(value); })}<div className="score-grid">{score("Sabor", taste, setTaste, true)}{score("Precio", price, setPrice, true)}</div><fieldset className="tag-picker"><legend>El lugar</legend><div className="venue-score-grid">{venueMetrics.map(([key, label]) => score(label, metrics[key as Metric], (value) => setMetrics((current) => ({ ...current, [key]: value })), true))}</div></fieldset><label>Comentario <small className="tiny">Opcional</small><textarea name="comment" defaultValue={review?.comment} maxLength={2000} placeholder="Contá la experiencia…" /></label><button className="main-button" disabled={mutation.isPending || remove.isPending}>{mutation.isPending ? "Guardando…" : review ? "✓ Guardar reseña" : "＋ Agregar reseña"}</button>{review && <button className="danger-button" type="button" disabled={mutation.isPending || remove.isPending} onClick={() => remove.mutate()}>× Borrar reseña</button>}{(mutation.error || remove.error) && <p className="form-error">{(mutation.error || remove.error)!.message}</p>}</form></Modal>;
}
