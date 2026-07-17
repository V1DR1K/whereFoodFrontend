import { useState } from 'react';
import { mediaUrl } from '../../lib/api';
import type { FunPhoto } from '../../types/domain';

export function FunPhotoGallery({ photos, venueName, onDelete }: { photos: FunPhoto[]; venueName: string; onDelete?: (photo: FunPhoto) => void }) {
 const [selected, setSelected] = useState<FunPhoto>();
 return <><div className="fun-photo-gallery">{photos.map((photo, index) => <article key={photo.id}><button type="button" onClick={() => setSelected(photo)} aria-label={`Abrir foto ${index + 1} de ${venueName}`}><img src={mediaUrl(photo.thumbnailUrl)} alt={`Foto ${index + 1} de ${venueName}`} loading="lazy" decoding="async" /></button>{onDelete && <button className="text-button" type="button" onClick={() => onDelete(photo)}>Quitar foto</button>}</article>)}</div>{selected && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`Foto de ${venueName}`} onMouseDown={() => setSelected(undefined)}><button className="photo-lightbox-close" type="button" onClick={() => setSelected(undefined)} aria-label="Cerrar foto">×</button><img src={mediaUrl(selected.url)} alt={`Foto ampliada de ${venueName}`} onMouseDown={event => event.stopPropagation()} /></div>}</>;
}
