import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Film } from '../../types/domain';
import { Modal } from '../../components/ui/Modal';
import { getFilmGenres, getPlatforms, saveFilm, saveFilmGenre, type FilmInput, uploadFilmPhoto } from './films';

const inputFrom = (form: FormData): Omit<FilmInput, 'genres'> => ({
  title: String(form.get('title')).trim(),
  originalTitle: String(form.get('originalTitle')).trim() || undefined,
  synopsis: String(form.get('synopsis')).trim() || undefined,
  releaseDate: String(form.get('releaseDate')) || undefined,
  posterPath: String(form.get('posterPath')).trim() || undefined,
  platformId: form.get('platformId') ? Number(form.get('platformId')) : undefined,
});

export function FilmForm({ onClose, film }: { onClose: () => void; film?: Film }) {
  const qc = useQueryClient();
  const [genres, setGenres] = useState<string[]>(film?.genres ?? []);
  const [file, setFile] = useState<File>();
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreEmoji, setNewGenreEmoji] = useState('🎞️');
  const platforms = useQuery({ queryKey: ['watch-platforms'], queryFn: getPlatforms });
  const genreOptions = useQuery({ queryKey: ['film-genres'], queryFn: getFilmGenres });
  const addGenre = useMutation({
    mutationFn: () => saveFilmGenre({ name: newGenreName.trim(), emoji: newGenreEmoji.trim() }),
    onSuccess: async option => {
      await qc.invalidateQueries({ queryKey: ['film-genres'] });
      setGenres(current => current.includes(option.name) ? current : [...current, option.name]);
      setNewGenreName(''); setNewGenreEmoji('🎞️');
    },
  });
  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const saved = await saveFilm({ ...inputFrom(data), genres }, film?.id);
      return file ? uploadFilmPhoto(saved.id, file) : saved;
    },
    onSuccess: async value => { await Promise.all([qc.invalidateQueries({ queryKey: ['films'] }), qc.invalidateQueries({ queryKey: ['film', value.id] })]); onClose(); },
  });
  const availablePlatforms = [...(platforms.data ?? []), ...(film?.platform && !platforms.data?.some(value => value.id === film.platform?.id) ? [film.platform] : [])];
  const visibleOptions = [...(genreOptions.data ?? []), ...genres.filter(name => !genreOptions.data?.some(option => option.name === name)).map(name => ({ id: -name.length, name, emoji: '🎞️' }))];
  const toggleGenre = (name: string) => setGenres(current => current.includes(name) ? current.filter(value => value !== name) : [...current, name]);

  return <Modal onClose={onClose}><form className="film-form" onSubmit={event => { event.preventDefault(); save.mutate(new FormData(event.currentTarget)); }}>
    <p className="eyebrow">{film ? 'EDITAR PELÍCULA' : 'NUEVA PELÍCULA'}</p>
    <h2>{film ? 'Afinemos la ficha' : '¿Qué quieren guardar?'}</h2>
    <label>Título<input name="title" defaultValue={film?.title} required autoFocus /></label>
    <label>Título original<input name="originalTitle" defaultValue={film?.originalTitle} /></label>
    <label>Sinopsis<textarea name="synopsis" defaultValue={film?.synopsis} placeholder="¿De qué trata?" /></label>
    <div className="form-columns"><label>Fecha de estreno<input name="releaseDate" type="date" defaultValue={film?.releaseDate} /></label><label>Plataforma<select name="platformId" defaultValue={film?.platform?.id ?? ''}><option value="">Todavía no sabemos</option>{availablePlatforms.map(platform => <option key={platform.id} value={platform.id}>{platform.icon} {platform.name}{!platform.active ? ' (inactiva)' : ''}</option>)}</select></label></div>
    <label>Foto o póster<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0])} /></label>
    <small className="tiny">{file ? `Se cargará ${file.name}.` : film?.posterUrl ? 'La imagen actual se conservará si no elegís otra.' : 'Podés subir una imagen; se adapta automáticamente a los mosaicos.'}</small>
    <label>URL del póster <small>opcional, si no subís una imagen</small><input name="posterPath" type="url" defaultValue={film?.posterUrl?.startsWith('/films/') ? '' : film?.posterUrl} /></label>
    <fieldset className="tag-picker film-genre-picker"><legend>Géneros</legend><p>Elegí todos los que correspondan. También podés crear uno nuevo.</p><div className="tag-options">{visibleOptions.map(option => <label className="tag-option" key={option.id}><input type="checkbox" checked={genres.includes(option.name)} onChange={() => toggleGenre(option.name)} /><span>{option.emoji} {option.name}</span></label>)}</div><div className="tag-create-row"><input aria-label="Emoji del nuevo género" value={newGenreEmoji} maxLength={8} onChange={event => setNewGenreEmoji(event.target.value)} /><input aria-label="Nombre del nuevo género" placeholder="Nuevo género" value={newGenreName} onChange={event => setNewGenreName(event.target.value)} /><button className="secondary-button" type="button" disabled={!newGenreName.trim() || addGenre.isPending} onClick={() => addGenre.mutate()}>Agregar</button></div>{addGenre.error && <p className="form-error">{addGenre.error.message}</p>}</fieldset>
    <button className="main-button" disabled={save.isPending}>{save.isPending ? 'Guardando…' : film ? 'Guardar película' : 'Guardar en WhichFilm'} ✦</button>{save.error && <p className="form-error">{save.error.message}</p>}
  </form></Modal>;
}
