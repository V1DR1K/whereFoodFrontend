import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadMore } from "../../components/ui/Pagination";
import { Modal } from "../../components/ui/Modal";
import type { FunCategory } from "../../types/domain";
import { FunVenueCard } from "./FunVenueCard";
import { FunVenueForm } from "./FunVenueForm";
import { getFunCategories, getFunPlans } from "./whyFun";

function FilterChips({ label, allLabel, categories, selected, onSelect }: { label: string; allLabel: string; categories: FunCategory[]; selected?: number; onSelect: (id?: number) => void }) {
  const [showAll, setShowAll] = useState(false);
  const options = showAll ? categories : categories.slice(0, 6);
  const choose = (id?: number) => { onSelect(id); setShowAll(false); };
  return <section className="fun-filter"><span>{label}</span><div className="chips"><button className={!selected ? "selected" : ""} onClick={() => choose()}>{allLabel}</button>{options.map(category => <button key={category.id} className={category.id === selected ? "selected" : ""} onClick={() => choose(category.id)}>{category.icon} {category.name}</button>)}{categories.length > 6 && <button className="food-filter-more" onClick={() => setShowAll(true)} aria-label={`Ver más ${label.toLowerCase()}`}>•••</button>}</div>{showAll && <Modal onClose={() => setShowAll(false)}><p className="eyebrow">FILTRAR POR {label.toUpperCase()}</p><h2>Elegí una opción</h2><div className="chips fun-filter-dialog"><button className={!selected ? "selected" : ""} onClick={() => choose()}>{allLabel}</button>{categories.map(category => <button key={category.id} className={category.id === selected ? "selected" : ""} onClick={() => choose(category.id)}>{category.icon} {category.name}</button>)}</div></Modal>}</section>;
}

function PlanSection({ timeline, title, eyebrow, empty, categoryId, subcategoryId, filtered }: { timeline: 'UPCOMING' | 'PAST' | 'UNSCHEDULED'; title: string; eyebrow: string; empty: string; categoryId?: number; subcategoryId?: number; filtered: boolean }) {
  const plans = useInfiniteQuery({ queryKey: ['fun-plans', timeline, categoryId, subcategoryId], queryFn: ({ pageParam }) => getFunPlans({ timeline, categoryId, subcategoryId, cursor: pageParam }), initialPageParam: undefined as number | undefined, getNextPageParam: page => page.nextCursor ?? undefined });
  const list = plans.data?.pages.flatMap(page => page.content) ?? [];
  return <section className="fun-section"><div className="section-title"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><strong>Mostrando {list.length} salida{list.length === 1 ? '' : 's'}</strong></div>{plans.isError ? <p className="form-error">{plans.error.message}</p> : plans.isLoading ? <p className="muted" aria-busy="true">Cargando salidas…</p> : list.length ? <div className="fun-grid">{list.map(plan => <FunVenueCard key={plan.id} plan={plan} />)}</div> : <p className="empty-state">{filtered ? 'No hay salidas que coincidan con estos filtros.' : empty}</p>}<LoadMore enabled={plans.hasNextPage} onClick={() => plans.fetchNextPage()} loading={plans.isFetchingNextPage} label="Ver más salidas" /></section>;
}

export function WhyFunPage() {
  const [categoryId, setCategoryId] = useState<number>();
  const [subcategoryId, setSubcategoryId] = useState<number>();
  const [creating, setCreating] = useState(false);
  const categories = useQuery({ queryKey: ["fun-categories"], queryFn: getFunCategories });
  const roots = (categories.data ?? []).filter(category => !category.parentId);
  const subcategories = (categories.data ?? []).filter(category => category.parentId === categoryId);
  const chooseCategory = (id?: number) => { setCategoryId(id); setSubcategoryId(undefined); };
  const filtered = Boolean(categoryId || subcategoryId);
  return <><section className="fun-hero"><div><p className="eyebrow">SALIR A JUGAR</p><h1>¿Qué vamos a<br /><em>hacer </em> hoy?</h1><p>Agenden cada salida con su fecha, fotos y las opiniones de cómo la pasaron.</p></div><div className="fun-hero-art">🎲<span>✦</span><b>🕹️</b></div></section><nav className="quick-nav quick-nav-action"><button className="add-fun-button" onClick={() => setCreating(true)}><span>＋</span><span><small>NUEVA SALIDA</small>Agendar plan</span><b>🎯</b></button></nav><section className="fun-controls"><FilterChips label="Categorías" allLabel="Todo" categories={roots} selected={categoryId} onSelect={chooseCategory} />{categoryId && <FilterChips label="Subcategorías" allLabel="Todas" categories={subcategories} selected={subcategoryId} onSelect={setSubcategoryId} />}</section>{categories.isError && <p className="form-error">No pudimos cargar las categorías. Probá nuevamente.</p>}<PlanSection timeline="UPCOMING" eyebrow="PRÓXIMAMENTE" title="Salidas agendadas" empty="Todavía no tienen una salida agendada." categoryId={categoryId} subcategoryId={subcategoryId} filtered={filtered} /><PlanSection timeline="PAST" eyebrow="HISTORIAL" title="Salidas realizadas" empty="Cuando pase una salida, aparecerá acá con sus fotos y opiniones." categoryId={categoryId} subcategoryId={subcategoryId} filtered={filtered} /><PlanSection timeline="UNSCHEDULED" eyebrow="POR COMPLETAR" title="Planes sin fecha" empty="No hay planes pendientes de fecha." categoryId={categoryId} subcategoryId={subcategoryId} filtered={filtered} />{creating && <FunVenueForm onClose={() => setCreating(false)} />}</>;
}
