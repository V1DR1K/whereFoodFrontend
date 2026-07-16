import type { Item } from "../../types/domain";
import { StarRating } from "../../components/ui/StarRating";
import { useState } from "react";
export function ItemCard({
  item,
  onEdit,
  canEdit,
}: {
  item: Item;
  onEdit: (item: Item) => void;
  canEdit: boolean;
}) {
  const photoUrl = item.photoUrl ?? item.thumbnailUrl;
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="item-card">
      {photoUrl && (
        <button
          className="item-photo-button"
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Ampliar foto de ${item.name}`}
        >
          <img src={photoUrl} alt={`Foto de ${item.name}`} />
        </button>
      )}
      <div>
        <div className="item-card-heading">
          <div>
            <h3>{item.name}</h3>
            <p className="byline">Reseña de {item.author}</p>
          </div>
          {canEdit && (
            <button
              className="icon-edit"
              onClick={() => onEdit(item)}
              aria-label={`Editar ${item.name}`}
            >
              ✎
            </button>
          )}
        </div>
        {item.comment && <p>{item.comment}</p>}
        <div className="item-scores">
          <span>
            Sabor <StarRating label="Sabor" value={item.taste} />
          </span>
          <span>
            Precio <StarRating label="Precio" value={item.price} />
          </span>
        </div>
      </div>
      {expanded && photoUrl && (
        <div
          className="photo-lightbox"
          role="presentation"
          onClick={() => setExpanded(false)}
        >
          <button
            className="photo-lightbox-close"
            type="button"
            aria-label="Cerrar foto ampliada"
            onClick={() => setExpanded(false)}
          >
            ×
          </button>
          <img
            src={photoUrl}
            alt={`Foto ampliada de ${item.name}`}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
