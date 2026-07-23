import { Link } from "react-router-dom";
import type { Activity } from "../../types/domain";

export function FunVenueCard({ activity }: { activity: Activity }) {
  return <Link className="fun-card-link" to={`/why-fun/${activity.id}`} aria-label={`Ver actividad ${activity.name}`}><article className="fun-card"><div className="fun-card__photo"><span>{activity.subcategory.icon}</span><small>{activity.category.icon} {activity.category.name}</small></div><div className="fun-card__body"><div><p>{activity.subcategory.name}</p><h3>{activity.name}</h3></div><address>📍 {activity.address}</address><footer><span>{activity.schedules.length ? `${activity.schedules.length} horario${activity.schedules.length === 1 ? "" : "s"}` : "Horarios por definir"}</span><span>Ver actividad →</span></footer></div></article></Link>;
}
