import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/api';
import type { FunVenue } from '../../types/domain';

export function FunVenueCard({ venue }: { venue: FunVenue }) {
 const photo = venue.coverPhoto;
 return <Link className="fun-card-link" to={`/why-fun/${venue.id}`} aria-label={`Ver ficha de ${venue.name}`}><article className="fun-card"><div className="fun-card__photo">{photo ? <img src={mediaUrl(photo.thumbnailUrl)} alt={`Foto de ${venue.name}`} loading="lazy" decoding="async" /> : <span>{venue.subcategory.icon}</span>}<small>{venue.category.icon} {venue.category.name}</small></div><div className="fun-card__body"><div><p>{venue.subcategory.icon} {venue.subcategory.name}</p><h3>{venue.name}</h3></div>{venue.reviewCount > 0 && <b aria-label={`Promedio de las últimas opiniones: ${venue.rating.toFixed(1)} sobre 5`}>{venue.rating.toFixed(1)} <span>★</span></b>}<address>📍 {venue.address}</address><footer><span>{venue.reviewCount ? `${venue.reviewCount} opinión${venue.reviewCount === 1 ? '' : 'es'} actual${venue.reviewCount === 1 ? '' : 'es'}` : 'Sin opiniones'}</span><span>Ver ficha →</span></footer></div></article></Link>;
}
