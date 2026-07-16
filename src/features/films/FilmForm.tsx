import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Film } from '../../types/domain';
import { Modal } from '../../components/ui/Modal';
import { getPlatforms, saveFilm, type FilmInput } from './films';

const inputFrom=(form:FormData):FilmInput=>({
 title:String(form.get('title')).trim(),originalTitle:String(form.get('originalTitle')).trim()||undefined,synopsis:String(form.get('synopsis')).trim()||undefined,releaseDate:String(form.get('releaseDate'))||undefined,posterPath:String(form.get('posterPath')).trim()||undefined,genres:String(form.get('genres')).split(',').map(value=>value.trim()).filter(Boolean),platformId:form.get('platformId')?Number(form.get('platformId')):undefined,
});

export function FilmForm({onClose,film}:{onClose:()=>void;film?:Film}){
 const qc=useQueryClient();
 const platforms=useQuery({queryKey:['watch-platforms'],queryFn:getPlatforms});
 const save=useMutation({mutationFn:(data:FormData)=>saveFilm(inputFrom(data),film?.id),onSuccess:async value=>{await Promise.all([qc.invalidateQueries({queryKey:['films']}),qc.invalidateQueries({queryKey:['film',value.id]})]);onClose()}});
 const availablePlatforms=[...(platforms.data??[]),...(film?.platform&&!platforms.data?.some(value=>value.id===film.platform?.id)?[film.platform]:[])];
 return <Modal onClose={onClose}><form className="film-form" onSubmit={event=>{event.preventDefault();save.mutate(new FormData(event.currentTarget))}}><p className="eyebrow">{film?'EDITAR PELÍCULA':'NUEVA PELÍCULA'}</p><h2>{film?'Afinemos la ficha':'¿Qué quieren guardar?'}</h2><label>Título<input name="title" defaultValue={film?.title} required autoFocus/></label><label>Título original<input name="originalTitle" defaultValue={film?.originalTitle}/></label><label>Sinopsis<textarea name="synopsis" defaultValue={film?.synopsis} placeholder="¿De qué trata?"/></label><div className="form-columns"><label>Año / estreno<input name="releaseDate" type="date" defaultValue={film?.releaseDate}/></label><label>Plataforma<select name="platformId" defaultValue={film?.platform?.id??''}><option value="">Todavía no sabemos</option>{availablePlatforms.map(platform=><option key={platform.id} value={platform.id}>{platform.icon} {platform.name}{!platform.active?' (inactiva)':''}</option>)}</select></label></div><label>Géneros <small>separados por coma</small><input name="genres" defaultValue={film?.genres.join(', ')} placeholder="Romance, Drama"/></label><label>URL del póster <small>opcional</small><input name="posterPath" type="url" defaultValue={film?.posterUrl}/></label><button className="main-button" disabled={save.isPending}>{save.isPending?'Guardando…':film?'Guardar película':'Guardar en WhichFilm'} ✦</button>{save.error&&<p className="form-error">{save.error.message}</p>}</form></Modal>;
}
