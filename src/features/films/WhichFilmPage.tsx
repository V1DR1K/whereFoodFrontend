import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FilmCard } from './FilmCard';
import { FilmForm } from './FilmForm';
import { getFilmGenres, getFilms, getPlatforms } from './films';
import type { Film } from '../../types/domain';

function FilmSection({ title, eyebrow, films, empty }: { title: string; eyebrow: string; films: Film[]; empty: string }) {
  return <section className="film-section"><div className="section-title"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><strong>{films.length} películas</strong></div>{films.length ? <div className="film-grid">{films.map(film => <FilmCard key={film.id} film={film} />)}</div> : <p className="empty-state">{empty}</p>}</section>;
}

export function WhichFilmPage() {
  const [genre, setGenre] = useState('');
  const [platformId, setPlatformId] = useState<number>();
  const [showForm, setShowForm] = useState(false);
  const filmsQuery = useQuery({ queryKey: ['films', genre, platformId], queryFn: () => getFilms({ genre: genre || undefined, platformId }) });
  const platforms = useQuery({ queryKey: ['watch-platforms'], queryFn: getPlatforms });
  const genreOptions = useQuery({ queryKey: ['film-genres'], queryFn: getFilmGenres });
  const all = filmsQuery.data ?? [];
  const genres = useMemo(() => [...new Set(all.flatMap(film => film.genres))].sort((a, b) => a.localeCompare(b, 'es')), [all]);
  const filterGenres = genreOptions.data?.length ? genreOptions.data.map(option => option.name) : genres;
  const pending = all.filter(film => film.watchedCount === 0);
  const watched = all.filter(film => film.watchedCount > 0);
  return <>
    <section className="film-hero"><div><p className="eyebrow">NUESTRA SALA PERSONAL</p><h1>¿Qué vamos a<br /><em>mirar</em> hoy?</h1><p>Una colección para las películas que todavía esperan y las que ya se quedaron con nosotros. 🍿</p></div><div className="film-hero-art" aria-hidden="true">🎬<span>✨</span><b>🍿</b></div></section>
    <nav className="quick-nav quick-nav-action"><button className="add-film-button" onClick={() => setShowForm(true)}><span className="add-film-icon">＋</span><span><small>NUEVA PELÍCULA</small>Buscar o cargar</span><b>🎞️</b></button></nav>
    <section className="film-controls"><label>Género<select value={genre} onChange={event => setGenre(event.target.value)}><option value="">Todos</option>{filterGenres.map(value => <option value={value} key={value}>{value}</option>)}</select></label><label>Plataforma<select value={platformId ?? ''} onChange={event => setPlatformId(event.target.value ? Number(event.target.value) : undefined)}><option value="">Todas</option>{platforms.data?.map(platform => <option value={platform.id} key={platform.id}>{platform.icon} {platform.name}</option>)}</select></label></section>
    {filmsQuery.isError ? <p className="form-error">{filmsQuery.error.message}</p> : <><FilmSection films={pending} eyebrow="EN LA LISTA" title="Para ver" empty="Todavía no hay películas en la lista. ¡Busquen la primera!" /><FilmSection films={watched} eyebrow="YA PASARON POR LA SALA" title="Vistas y reseñadas" empty="Cuando sumen la primera vista, aparecerá acá." /></>}
    {showForm && <FilmForm onClose={() => setShowForm(false)} />}
  </>;
}
