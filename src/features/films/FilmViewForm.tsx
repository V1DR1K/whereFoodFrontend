import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/ui/Modal';
import type { Film, FilmView } from '../../types/domain';
import { addFilmView } from './films';

export function FilmViewForm({ film, onClose, onCreated }: { film: Film; onClose: () => void; onCreated: (view: FilmView) => void }) {
  const qc = useQueryClient();
  const title = film.tmdb?.title ?? film.title;
  const mutation = useMutation({
    mutationFn: (form: FormData) => addFilmView(film.id, String(form.get('watchedOn'))),
    onSuccess: async view => {
      await Promise.all([qc.invalidateQueries({ queryKey: ['film', film.id] }), qc.invalidateQueries({ queryKey: ['films'] })]);
      onCreated(view);
    },
  });

  return <Modal onClose={onClose}><form onSubmit={event => { event.preventDefault(); mutation.mutate(new FormData(event.currentTarget)); }}>
    <p className="eyebrow">{film.watchedCount ? 'NUEVA VISTA' : 'PRIMERA VISTA'}</p>
    <h2>{title}</h2>
    <p className="muted">Primero registren que la vieron. Después cada uno puede sumar su reseña a esta misma vista.</p>
    <label>¿Cuándo la vieron?<input name="watchedOn" type="date" defaultValue={new Date().toLocaleDateString('sv-SE')} required /></label>
    <button className="main-button" disabled={mutation.isPending}>{mutation.isPending ? 'Registrando…' : film.watchedCount ? 'Registrar nueva vista' : 'Registrar primera vista'} ✦</button>
    {mutation.error && <p className="form-error">{mutation.error.message}</p>}
  </form></Modal>;
}
