import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { mediaUrl } from '../../lib/api';
import type { HomeRecipe } from '../../types/domain';
import { HomeRecipeForm } from './HomeRecipeForm';
import { getHomeRecipe } from './homeRecipes';

const homeName = (home: HomeRecipe['home']) => home === 'TOMAS' ? 'Tomás' : 'Avril';
const mealName = (meal: HomeRecipe['mealType']) => ({ DESAYUNO: 'Desayuno', ALMUERZO: 'Almuerzo', MERIENDA: 'Merienda', CENA: 'Cena' })[meal];
const dateLabel = (date: string) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

export function HomeRecipeDetailPage() {
  const id = Number(useParams().id);
  const validId = Number.isInteger(id) && id > 0;
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const recipeQuery = useQuery({ queryKey: ['home-recipe', id], queryFn: () => getHomeRecipe(id), enabled: validId });

  if (!validId || recipeQuery.isError || (!recipeQuery.isLoading && !recipeQuery.data)) return <p className="form-error">No pudimos abrir esa receta. Volvé a HowCook e intentá otra vez.</p>;
  if (recipeQuery.isLoading) return <p>Cargando receta…</p>;

  const recipe = recipeQuery.data!;
  const image = recipe.photoUrl ?? recipe.thumbnailUrl;

  return <section className="home-recipe-detail">
    <Link to="/how-cook">← Volver a HowCook</Link>
    <div className="home-recipe-detail__hero">
      <div className="home-recipe-detail__photo">{image ? <img src={mediaUrl(image)} alt={`Foto de ${recipe.name}`} /> : <span>🍳</span>}</div>
      <div className="home-recipe-detail__summary">
        <p className="eyebrow">{recipe.home === 'TOMAS' ? '🏠 CASA TOMÁS' : '🏡 CASA AVRIL'} · {mealName(recipe.mealType).toUpperCase()}</p>
        <h1>{recipe.name}</h1>
        <p>Preparó {recipe.author} el {dateLabel(recipe.preparedOn)} en casa de {homeName(recipe.home)}.</p>
      </div>
      <div className="detail-actions">
        <button className="secondary-button" type="button" onClick={() => setEditing(true)}>✎ Editar receta o foto</button>
        <button className="main-button" type="button" onClick={() => setRepeating(true)}>↻ Repetir receta</button>
      </div>
    </div>
    <section className="home-recipe-detail__content">
      <div className="home-recipe-detail__panel">
        <p className="eyebrow">INGREDIENTES</p>
        <h2>Para preparar</h2>
        <ul>{recipe.ingredients.map((ingredient, index) => <li key={`${ingredient.name}-${index}`}><strong>{ingredient.grams} g</strong> {ingredient.name}</li>)}</ul>
      </div>
      <div className="home-recipe-detail__panel">
        <p className="eyebrow">RECETA</p>
        <h2>Cómo se hace</h2>
        {recipe.recipeUrl ? <a className="main-button recipe-detail-button" href={recipe.recipeUrl} target="_blank" rel="noreferrer">Abrir receta original ↗</a> : <p className="muted">Todavía no guardaron un enlace para esta receta.</p>}
      </div>
    </section>
    {editing && <HomeRecipeForm home={recipe.home} recipe={recipe} onClose={() => setEditing(false)} onDeleted={() => navigate('/how-cook')} />}
    {repeating && <HomeRecipeForm home={recipe.home} copyOf={recipe} onClose={() => setRepeating(false)} />}
  </section>;
}
