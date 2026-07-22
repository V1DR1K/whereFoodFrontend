import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/api';
import type { FunPlan } from '../../types/domain';

const dateLabel = (value?: string) => value ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'SIN FECHA';

export function FunVenueCard({ plan }: { plan: FunPlan }) {
 const photo = plan.coverPhoto;
 return <Link className="fun-card-link" to={`/why-fun/${plan.id}`} aria-label={`Ver salida ${plan.name}`}><article className="fun-card"><div className="fun-card__photo">{photo ? <img src={mediaUrl(photo.thumbnailUrl)} alt={`Foto de ${plan.name}`} loading="lazy" decoding="async" /> : <span>{plan.subcategory.icon}</span>}<small>{plan.category.icon} {plan.category.name}</small></div><div className="fun-card__body"><div><p>{dateLabel(plan.scheduledAt)}</p><h3>{plan.name}</h3></div>{plan.reviewCount > 0 && <b aria-label={`Promedio de opiniones: ${plan.rating.toFixed(1)} sobre 5`}>{plan.rating.toFixed(1)} <span>★</span></b>}<address>📍 {plan.address}</address><footer><span>{plan.reviewCount ? `${plan.reviewCount} opinión${plan.reviewCount === 1 ? '' : 'es'}` : plan.scheduledAt ? 'Salida sin reseñas' : 'Falta agendar fecha'}</span><span>Ver salida →</span></footer></div></article></Link>;
}
