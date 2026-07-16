import { api } from '../../lib/api';
import type { CatalogFilm, Film, FilmReview, WatchPlatform } from '../../types/domain';

export type FilmInput={title:string;tmdbId?:number;originalTitle?:string;synopsis?:string;releaseDate?:string;posterPath?:string;genres:string[];platformId?:number};
export type PlatformInput={name:string;icon:string;active:boolean};
export const getFilms=(filters:{genre?:string;platformId?:number;watched?:boolean}={})=>{
 const query=new URLSearchParams(); if(filters.genre)query.set('genre',filters.genre);if(filters.platformId)query.set('platformId',String(filters.platformId));if(filters.watched!==undefined)query.set('watched',String(filters.watched));
 return api<Film[]>(`/films${query.size?`?${query}`:''}`);
};
export const getFilm=(id:number)=>api<Film>(`/films/${id}`);
export const saveFilm=(input:FilmInput,id?:number)=>api<Film>(`/films${id?`/${id}`:''}`,{method:id?'PUT':'POST',body:JSON.stringify(input)});
export const deleteFilm=(id:number)=>api<void>(`/films/${id}`,{method:'DELETE'});
export const adjustWatchCount=(id:number,delta:number,watchedOn?:string)=>api<Film>(`/films/${id}/watch-count`,{method:'PATCH',body:JSON.stringify({delta,watchedOn})});
export const saveFilmReview=(id:number,input:Pick<FilmReview,'rating'|'comment'|'watchedOn'>)=>api<FilmReview>(`/films/${id}/review`,{method:'PUT',body:JSON.stringify(input)});
export const searchCatalog=(query:string)=>api<CatalogFilm[]>(`/film-catalog/search?query=${encodeURIComponent(query)}`);
export const getCatalogFilm=(tmdbId:number)=>api<CatalogFilm>(`/film-catalog/${tmdbId}`);
export const getPlatforms=()=>api<WatchPlatform[]>('/watch-platforms');
export const getAllPlatforms=()=>api<WatchPlatform[]>('/watch-platforms/all');
export const savePlatform=(input:PlatformInput,id?:number)=>api<WatchPlatform>(`/watch-platforms${id?`/${id}`:''}`,{method:id?'PUT':'POST',body:JSON.stringify(input)});
