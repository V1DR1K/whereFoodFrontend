import type { Item } from "../../types/domain";
import { AdaptivePhoto } from "../../components/ui/AdaptivePhoto";
import { StarRating } from "../../components/ui/StarRating";

export function ItemCard({ item, username, onEditItem, onEditReview }: { item: Item; username?: string; onEditItem: (item: Item) => void; onEditReview: (item: Item) => void }) {
  const photoUrl = item.photoUrl ?? item.thumbnailUrl;
  const ownReview = item.reviews.find((review) => review.author === username);
  return <article className="item-card">{photoUrl && <AdaptivePhoto alt={`Foto de ${item.name}`} context="item" height={item.photoHeight} src={photoUrl} width={item.photoWidth} />}<div><div className="item-card-heading"><div><h3>{item.name}</h3><p className="byline">Agregado por {item.createdBy}</p></div><div className="item-card-actions">{item.createdBy === username && <button className="icon-edit" type="button" onClick={() => onEditItem(item)} aria-label={`Editar ${item.name}`}>✎</button>}<button className="secondary-button" type="button" onClick={() => onEditReview(item)}>{ownReview ? "Editar mi reseña" : "Escribir mi reseña"}</button></div></div><div className="item-review-columns">{item.reviews.map((review) => <section className="item-review" key={review.author}><h4>{review.author === username ? "Tu reseña" : `Reseña de ${review.author}`}</h4>{review.comment && <p>{review.comment}</p>}<div className="item-scores"><span>Sabor <StarRating label={`Sabor de ${review.author}`} value={review.taste} /></span><span>Precio <StarRating label={`Precio de ${review.author}`} value={review.price} /></span></div></section>)}</div></div></article>;
}
