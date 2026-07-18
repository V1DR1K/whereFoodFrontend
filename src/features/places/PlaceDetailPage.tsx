import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getPlace } from "./places";
import { getVisit, getVisits } from "../items/items";
import { ItemCard } from "../items/ItemCard";
import { ItemForm } from "../items/ItemForm";
import { ItemReviewForm } from "../items/ItemReviewForm";
import { VisitForm } from "../items/VisitForm";
import { PlaceForm } from "./PlaceForm";
import { StarRating } from "../../components/ui/StarRating";
import { AdaptivePhoto } from "../../components/ui/AdaptivePhoto";
import { mediaUrl, session } from "../../lib/api";
import type { Item, PlaceVisitSummary } from "../../types/domain";

const mapsSearch = (address?: string) => address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Rosario, Santa Fe, Argentina`)}` : undefined;
const reviewLabels: { key: "location" | "heating" | "bathrooms" | "exterior" | "seating" | "service" | "ambiance"; label: string }[] = [
  { key: "location", label: "Ubicación" }, { key: "heating", label: "Calefacción" }, { key: "bathrooms", label: "Baños" }, { key: "exterior", label: "Exterior" }, { key: "seating", label: "Asientos" }, { key: "service", label: "Atención" }, { key: "ambiance", label: "Ambiente" },
];
const score = (value: number | undefined) => typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";
const visitDateLabel = (date: string) => new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));

export function PlaceDetailPage() {
  const id = Number(useParams().id);
  const validId = Number.isInteger(id) && id > 0;
  const [itemForm, setItemForm] = useState<Item | null | undefined>();
  const [reviewingItem, setReviewingItem] = useState<Item>();
  const [editingPlace, setEditingPlace] = useState(false);
  const [editingVisit, setEditingVisit] = useState<PlaceVisitSummary | null | undefined>();
  const [selectedVisitId, setSelectedVisitId] = useState<number>();
  const place = useQuery({ queryKey: ["place", id], queryFn: () => getPlace(id), enabled: validId });
  const visits = useQuery({ queryKey: ["visits", id], queryFn: () => getVisits(id), enabled: validId && place.isSuccess });
  const visitList = visits.data ?? [];

  useEffect(() => {
    if (visitList.length && !visitList.some((visit) => visit.id === selectedVisitId)) setSelectedVisitId(visitList[0].id);
  }, [selectedVisitId, visitList]);

  const selectedVisit = visitList.find((entry) => entry.id === selectedVisitId);
  const visit = useQuery({ queryKey: ["visit", selectedVisitId], queryFn: () => getVisit(selectedVisitId!), enabled: Boolean(selectedVisitId) });

  if (!validId || place.isError || (!place.isLoading && !place.data)) return <p className="form-error">No pudimos cargar ese lugar. Volvé al mapa e intentá de nuevo.</p>;
  if (place.isLoading) return <p>Cargando lugar…</p>;

  const venue = place.data!;
  const username = session.get()?.username;
  const pending = venue.status === "PENDING";
  const mapsUrl = venue.mapsUrl || mapsSearch(venue.address);
  const coverPhoto = venue.photoUrl || venue.thumbnailUrl;
  const selectedVisitIndex = visitList.findIndex((entry) => entry.id === selectedVisitId);
  const visitNumber = selectedVisitIndex < 0 ? 0 : visitList.length - selectedVisitIndex;

  return <section className="detail"><Link to="/food">← Volver al mapa</Link><div className="detail-heading"><div className="place-cover">{coverPhoto ? <AdaptivePhoto alt={`Foto de ${venue.name}`} context="place" height={venue.photoHeight} src={mediaUrl(coverPhoto)} width={venue.photoWidth} /> : <span className="place-cover-empty">{venue.category.icon}</span>}</div><div><p className="eyebrow">{pending ? "PENDIENTE · " : ""}{venue.category.name}</p><h1>{venue.name}</h1>{!!venue.tags?.length && <div className="place-tags place-tags--detail">{venue.tags.map((tag) => <span key={tag.id}>{tag.emoji} {tag.name}</span>)}</div>}<p>{mapsUrl ? <a className="address-link" href={mapsUrl} target="_blank" rel="noreferrer">📍 {venue.address || "Abrir en Google Maps"} ↗</a> : venue.address}{!pending && ` · ${score(venue.rating)} ★ · ${venue.itemCount} ítems`}</p>{venue.sourceUrl && <a className="source-link" href={venue.sourceUrl} target="_blank" rel="noreferrer">↗ Ver link de referencia</a>}</div><div className="detail-actions"><button className="secondary-button" onClick={() => setEditingPlace(true)}>{venue.author === username ? "✎ Editar lugar" : "★ Calificar lugar"}</button><button className="main-button" onClick={() => setEditingVisit(null)}>Fuimos de nuevo 🍽️</button>{selectedVisitId && <button className="secondary-button" onClick={() => setItemForm(null)}>Agregar ítem</button>}</div></div>{!pending && <section className="watch-counter" aria-label="Contador de visitas"><div><p className="eyebrow">CONTADOR COMPARTIDO</p><h2>{visitList.length === 0 ? "Todavía no fueron" : `${visitList.length} ${visitList.length === 1 ? "vez" : "veces"}`}</h2><p>Última visita: {visitList[0] ? visitDateLabel(visitList[0].visitedOn) : "pendiente"}</p></div><div><button className="counter-add food-counter-add" onClick={() => setEditingVisit(null)}>Fuimos de nuevo 🍽️</button></div></section>} {!pending && <section className="rating-breakdown" aria-label="Promedios globales"><div><span>😋 Sabor</span><strong>{score(venue.tasteAverage)}</strong><StarRating label="Promedio de sabor" value={Math.round(venue.tasteAverage || 0)} /></div><div><span>💸 Precio</span><strong>{score(venue.priceAverage)}</strong><StarRating label="Promedio de precio" value={Math.round(venue.priceAverage || 0)} /></div><div><span>📍 Lugar</span><strong>{score(venue.venueAverage)}</strong><StarRating label="Promedio del lugar" value={Math.round(venue.venueAverage || 0)} /></div></section>}<section className="reviews-section"><h2>Reseñas del lugar</h2><div className="review-columns">{venue.reviews.map((review) => <article className="place-review" key={review.author}><div className="place-review__heading"><h3>{review.author === username ? "Tu calificación" : `Calificación de ${review.author}`}</h3>{review.author === username && <button className="icon-edit" type="button" aria-label="Editar reseña" onClick={() => setEditingPlace(true)}>✎</button>}</div>{review.comment && <p>{review.comment}</p>}<div>{reviewLabels.map(({ key, label }) => <span key={key}>{label}<StarRating label={label} value={review[key]} /></span>)}</div></article>)}{!venue.reviews.length && <p className="empty-state">Todavía no hay calificaciones del lugar.</p>}</div></section><section className="visit-history"><div className="section-title"><div><p className="eyebrow">HISTORIAL COMPARTIDO</p><h2>Lo que pidieron</h2></div><strong>{visitList.length} visitas</strong></div>{!!visitList.length && <div className="item-date-pager" aria-label="Navegar visitas"><button type="button" className="date-chevron" aria-label="Ver visita más reciente" disabled={selectedVisitIndex <= 0} onClick={() => setSelectedVisitId(visitList[selectedVisitIndex - 1].id)}>‹</button><label>Visita #{visitNumber}<select value={selectedVisitId ?? ""} onChange={(event) => setSelectedVisitId(Number(event.target.value))}>{visitList.map((entry, index) => <option key={entry.id} value={entry.id}>Visita #{visitList.length - index} · {visitDateLabel(entry.visitedOn)}</option>)}</select></label><button type="button" className="date-chevron" aria-label="Ver visita anterior" disabled={selectedVisitIndex < 0 || selectedVisitIndex >= visitList.length - 1} onClick={() => setSelectedVisitId(visitList[selectedVisitIndex + 1].id)}>›</button>{visit.data?.createdBy === username && selectedVisit && <button className="icon-edit" type="button" onClick={() => setEditingVisit(selectedVisit)} aria-label="Editar fecha de visita">✎</button>}</div>}{visit.isError && <p className="form-error">No pudimos cargar los ítems de esta visita.</p>}<div className="item-list">{visit.data?.items.map((item) => <ItemCard key={item.id} item={item} username={username} onEditItem={setItemForm} onEditReview={setReviewingItem} />)}</div>{!visit.isLoading && !visit.data?.items.length && !!selectedVisitId && <p className="empty-state">No hay ítems cargados para esta visita.</p>}{!visitList.length && <p className="empty-state">Todavía no registraron una visita. Creen la primera cuando vuelvan a ir.</p>}</section>{itemForm !== undefined && selectedVisitId && <ItemForm placeId={id} visitId={selectedVisitId} item={itemForm ?? undefined} onClose={() => setItemForm(undefined)} />}{reviewingItem && selectedVisitId && <ItemReviewForm item={reviewingItem} review={reviewingItem.reviews.find((review) => review.author === username)} placeId={id} visitId={selectedVisitId} onClose={() => setReviewingItem(undefined)} />}{editingVisit !== undefined && <VisitForm placeId={id} visit={editingVisit ?? undefined} onClose={() => setEditingVisit(undefined)} onSaved={(saved) => setSelectedVisitId(saved.id)} />}{editingPlace && <PlaceForm place={venue} onClose={() => setEditingPlace(false)} />}</section>;
}
