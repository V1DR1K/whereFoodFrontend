import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FilmGenreOption, WatchPlatform } from '../../types/domain';
import { deleteFilmGenre, getAllPlatforms, getFilmGenres, saveFilmGenre, savePlatform } from './films';

type PlatformDraft = Pick<WatchPlatform, 'name' | 'icon' | 'active'>;
type GenreDraft = Pick<FilmGenreOption, 'name' | 'emoji'>;
const emptyPlatform: PlatformDraft = { name: '', icon: '📺', active: true };
const emptyGenre: GenreDraft = { name: '', emoji: '' };

export function PlatformManager() {
  const qc = useQueryClient();
  const platforms = useQuery({ queryKey: ['watch-platforms', 'all'], queryFn: getAllPlatforms });
  const genres = useQuery({ queryKey: ['film-genres'], queryFn: getFilmGenres });
  const [platformDraft, setPlatformDraft] = useState<PlatformDraft>(emptyPlatform);
  const [genreDraft, setGenreDraft] = useState<GenreDraft>(emptyGenre);
  const [editingPlatform, setEditingPlatform] = useState<number>();
  const [editingGenre, setEditingGenre] = useState<number>();
  const refreshPlatforms = () => Promise.all([qc.invalidateQueries({ queryKey: ['watch-platforms'] }), qc.invalidateQueries({ queryKey: ['films'] })]);
  const refreshGenres = () => Promise.all([qc.invalidateQueries({ queryKey: ['film-genres'] }), qc.invalidateQueries({ queryKey: ['films'] })]);
  const savePlatformMutation = useMutation({ mutationFn: () => savePlatform(platformDraft, editingPlatform), onSuccess: async () => { await refreshPlatforms(); setPlatformDraft(emptyPlatform); setEditingPlatform(undefined); } });
  const togglePlatform = useMutation({ mutationFn: (platform: WatchPlatform) => savePlatform({ ...platform, active: !platform.active }, platform.id), onSuccess: refreshPlatforms });
  const saveGenreMutation = useMutation({ mutationFn: () => saveFilmGenre(genreDraft, editingGenre), onSuccess: async () => { await refreshGenres(); setGenreDraft(emptyGenre); setEditingGenre(undefined); } });
  const removeGenre = useMutation({ mutationFn: deleteFilmGenre, onSuccess: refreshGenres });

  return <section className="settings-page"><p className="eyebrow">CONFIGURACIÓN COMPARTIDA</p><h2>Plataformas y géneros</h2><p className="intro">Tomás y Avril pueden mantener el catálogo disponible para WhichFilm.</p><div className="settings-grid film-settings-grid"><section className="platform-settings"><h3>¿Dónde las vieron?</h3><form className="inline-form platform-settings-form" onSubmit={event => { event.preventDefault(); savePlatformMutation.mutate(); }}><input aria-label="Ícono" value={platformDraft.icon} maxLength={8} onChange={event => setPlatformDraft({ ...platformDraft, icon: event.target.value })} required /><input placeholder="Nombre de la plataforma" value={platformDraft.name} onChange={event => setPlatformDraft({ ...platformDraft, name: event.target.value })} required /><button className="main-button" disabled={savePlatformMutation.isPending}>{editingPlatform ? 'Guardar' : 'Agregar'}</button></form>{savePlatformMutation.error && <p className="form-error">{savePlatformMutation.error.message}</p>}<div className="platform-list">{platforms.data?.map(platform => <article key={platform.id}><span>{platform.icon}</span><div><h3>{platform.name}</h3><small>{platform.active ? 'Disponible' : 'Inactiva'}</small></div><button className="text-button" onClick={() => { setEditingPlatform(platform.id); setPlatformDraft({ name: platform.name, icon: platform.icon, active: platform.active }); }}>Editar</button><button className="text-button" disabled={togglePlatform.isPending} onClick={() => togglePlatform.mutate(platform)}>{platform.active ? 'Desactivar' : 'Activar'}</button></article>)}</div></section><section className="genre-settings"><h3>Géneros</h3><form className="inline-form genre-settings-form" onSubmit={event => { event.preventDefault(); saveGenreMutation.mutate(); }}><input aria-label="Emoji del género" value={genreDraft.emoji} maxLength={8} onChange={event => setGenreDraft({ ...genreDraft, emoji: event.target.value })} required /><input placeholder="Nombre del género" value={genreDraft.name} onChange={event => setGenreDraft({ ...genreDraft, name: event.target.value })} required /><button className="main-button" disabled={saveGenreMutation.isPending}>{editingGenre ? 'Guardar' : 'Agregar'}</button></form>{saveGenreMutation.error && <p className="form-error">{saveGenreMutation.error.message}</p>}<p className="tiny">Al borrar un género, se quitará también de las películas que lo usan.</p><div className="platform-list">{genres.data?.map(genre => <article key={genre.id}><span>{genre.emoji}</span><div><h3>{genre.name}</h3><small>Género disponible</small></div><button className="text-button" onClick={() => { setEditingGenre(genre.id); setGenreDraft({ name: genre.name, emoji: genre.emoji }); }}>Editar</button><button className="text-button" disabled={removeGenre.isPending} onClick={() => { if (window.confirm(`¿Querés eliminar ${genre.name}? También se quitará de las películas asociadas.`)) removeGenre.mutate(genre.id); }}>Eliminar</button></article>)}</div></section></div></section>;
}
