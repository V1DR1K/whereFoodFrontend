import { Link } from "react-router-dom";
import type { Place } from "../../types/domain";
import { StarRating } from "../../components/ui/StarRating";
export function PlaceCard({ place }: { place: Place }) {
  const pending = place.status === "PENDING";
  const photo = place.thumbnailUrl ?? place.photoUrl;
  return (
    <Link
      className="place-card-link"
      to={`/places/${place.id}`}
      aria-label={`Ver detalle de ${place.name}`}
    >
      <article className={`place-card ${pending ? "pending-card" : ""}`}>
        <div className="food-poster">
          {photo ? (
            <img src={photo} alt={`Foto de ${place.name}`} />
          ) : (
            <span>{place.category.icon}</span>
          )}
          <small>{place.address || "Sin dirección"} 📍</small>
          {pending && <strong className="pending-badge">PENDIENTE</strong>}
        </div>
        <div className="card-body">
          <div className="card-top">
            <div>
              <p>{place.category.name}</p>
              <h3>{place.name}</h3>
            </div>
            {pending ? (
              <b className="pending-score">⌛ Ir</b>
            ) : (
              <b>
                {place.rating.toFixed(1)} <span>★</span>
              </b>
            )}
          </div>
          {pending ? (
            <p className="note">
              {place.address || "Guardado para la próxima salida"}
              {place.sourceUrl && " · Tiene link de referencia"}
            </p>
          ) : (
            <>
              <div className="rating-preview">
                <span>Promedio global</span>
                <StarRating
                  label="Puntuación promedio"
                  value={Math.round(place.rating)}
                />
              </div>
              <p className="note">Añadido por {place.author}</p>
            </>
          )}
          <footer>
            <span>
              {pending ? "📌 En la lista" : "💬 " + place.itemCount + " ítems"}
            </span>
            <span>Ver ficha →</span>
          </footer>
        </div>
      </article>
    </Link>
  );
}
