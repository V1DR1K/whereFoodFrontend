import { useState } from 'react';
import { mediaUrl } from '../../lib/api';
import type { FunPhoto } from '../../types/domain';

export function FunPhotoGallery({ photos, planName, coverPhotoId, onDelete, onSetCover }: { photos: FunPhoto[]; planName: string; coverPhotoId?: number; onDelete?: (photo: FunPhoto) => void; onSetCover?: (photo: FunPhoto) => void }) {
 const [selected, setSelected] = useState<FunPhoto>();
 return <><div className="fun-photo-gallery">{photos.map((photo, index) => <article key={photo.id}><button type="button" onClick={() => setSelected(photo)} aria-label={`Abrir foto ${index + 1} de ${planName}`}><img src={mediaUrl(photo.thumbnailUrl)} alt={`Foto ${index + 1} de ${planName}`} loading="lazy" decoding="async" /></button>{coverPhotoId === photo.id ? <small className="fun-cover-label">Portada</small> : onSetCover && <button className="text-button" type="button" onClick={() => onSetCover(photo)}>Usar de portada</button>}{onDelete && <button className="text-button" type="button" onClick={() => onDelete(photo)}>Quitar foto</button>}</article>)}</div>{selected && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`Foto de ${planName}`} onMouseDown={() => setSelected(undefined)}><button className="photo-lightbox-close" type="button" onClick={() => setSelected(undefined)} aria-label="Cerrar foto">×</button><img src={mediaUrl(selected.url)} alt={`Foto ampliada de ${planName}`} onMouseDown={event => event.stopPropagation()} /></div>}</>;
}
