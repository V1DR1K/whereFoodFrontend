import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { mediaUrl } from '../../lib/api';
import type { Home, HomeRecipe } from '../../types/domain';
import { HomeRecipeForm } from './HomeRecipeForm';
import { getHomeRecipes } from './homeRecipes';

const homeName = (home: Home) => home === 'TOMAS' ? 'Tomás' : 'Avril';
const mealName = (meal: HomeRecipe['mealType']) => ({ DESAYUNO: 'Desayuno', ALMUERZO: 'Almuerzo', MERIENDA: 'Merienda', CENA: 'Cena' })[meal];
const dateLabel = (date: string) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const average = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : undefined;

function RecipeSection({ home, onAdd }: { home: Home; onAdd: (home: Home) => void }) {
  const recipes = useQuery({ queryKey: ['home-recipes', home], queryFn: () => getHomeRecipes(home) });
  const list = recipes.data ?? [];
  return <section className="home-recipe-section">
    <div className="section-title"><div><p className="eyebrow">{home === 'TOMAS' ? '🏠 CASA TOMÁS' : '🏡 CASA AVRIL'}</p><h2>En casa de {homeName(home)}</h2></div></div>
    <button className="add-cook-button home-recipe-add" onClick={() => onAdd(home)}><span className="add-cook-icon">＋</span><span><small>RECETA CASERA</small>Anotar</span><b>🍳</b></button>
    {recipes.isError && <p className="form-error">{recipes.error.message}</p>}
    <div className="home-recipe-grid">{list.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
    {!recipes.isLoading && !list.length && <p className="empty-state">Todavía no anotaron recetas en esta casa.</p>}
  </section>;
}

function RecipeCard({ recipe }: { recipe: HomeRecipe }) {
  const image = recipe.photoUrl ?? recipe.thumbnailUrl;
  const rating = average(recipe.reviews.map(review => review.rating));
  return <Link className="home-recipe-card-link" to={`/how-cook/${recipe.id}`} aria-label={`Ver detalle de ${recipe.name}`}>
    <article className="home-recipe-card">
      {image ? <img src={mediaUrl(image)} alt={`Foto de ${recipe.name}`} /> : <div className="home-recipe-card__empty">🍳</div>}
      <div className="home-recipe-card__body">
        <div className="home-recipe-card__heading"><div><p>{mealName(recipe.mealType)} · {dateLabel(recipe.preparedOn)}</p><h3>{recipe.name}</h3></div>{rating !== undefined && <span className="home-recipe-card__rating">{rating.toFixed(1)} ★</span>}</div>
        <div className="ingredient-pills">{recipe.ingredients.slice(0, 4).map((ingredient, index) => <span key={`${ingredient.name}-${index}`}>{ingredient.grams} g · {ingredient.name}</span>)}</div>
        <footer className="recipe-card-actions"><small>Preparó {recipe.author}</small><span>{recipe.reviews.length ? `💬 ${recipe.reviews.length} reseña${recipe.reviews.length === 1 ? '' : 's'}` : 'Ver detalle'} →</span></footer>
      </div>
    </article>
  </Link>;
}

export function HomeRecipesPage() {
  const [formHome, setFormHome] = useState<Home>();
  return <section className="home-recipes">
    <Link to="/">← Volver a WhatPlan</Link>
    <section className="home-recipes__hero"><div><p className="eyebrow">HOWCOOK · RECETAS CON CARIÑO</p><h1>¿Qué vamos a <em>cocinar</em> hoy?</h1><p>Las comidas de todos los días, guardadas para repetir las que valieron la pena.</p></div><span>🏠</span></section>
    <RecipeSection home="TOMAS" onAdd={setFormHome} />
    <RecipeSection home="AVRIL" onAdd={setFormHome} />
    {formHome && <HomeRecipeForm home={formHome} onClose={() => setFormHome(undefined)} />}
  </section>;
}
