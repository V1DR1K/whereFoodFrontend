import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVisit, createVisit, updateVisit } from "./items";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { showNotice } from "../../lib/flash";
import type { PlaceVisitSummary } from "../../types/domain";

const today = () => new Date().toLocaleDateString("sv-SE");
const now = () => new Date().toTimeString().slice(0, 5);

export function VisitForm({ placeId, visit, onClose, onSaved, onDeleted }: { placeId: number; visit?: PlaceVisitSummary; onClose: () => void; onSaved: (visit: PlaceVisitSummary) => void; onDeleted?: () => void }) {
  const [visitedOn, setVisitedOn] = useState(visit?.visitedOn ?? today());
  const [visitedAt, setVisitedAt] = useState(visit?.visitedAt ?? now());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const queryClient = useQueryClient();
  const invalidate = (visitId?: number) => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["visits", placeId] }),
    queryClient.invalidateQueries({ queryKey: ["place", placeId] }),
    ...(visitId ? [queryClient.removeQueries({ queryKey: ["visit", visitId] })] : []),
  ]);
  const mutation = useMutation({
    mutationFn: () => visit ? updateVisit(visit.id, visitedOn, visitedAt) : createVisit(placeId, visitedOn, visitedAt),
    onSuccess: async saved => {
      await invalidate(visit?.id);
      onSaved(saved);
      showNotice(visit ? "Actualizamos la fecha y hora de la visita." : "Visita registrada. Ahora podés sumar los ítems que pidieron.");
      onClose();
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteVisit(visit!.id),
    onSuccess: async () => {
      await invalidate(visit!.id);
      showNotice("Eliminamos la visita y sus ítems asociados.");
      onDeleted?.();
      onClose();
    },
  });

  if (confirmingDelete && visit) return <ConfirmDialog title="¿Borrar esta visita?" message="También se eliminarán los ítems y reseñas cargados en esta fecha." confirmLabel="Borrar visita" pending={remove.isPending} onClose={() => setConfirmingDelete(false)} onConfirm={() => remove.mutate()} />;

  return <Modal onClose={onClose} confirmDiscard pending={mutation.isPending || remove.isPending}><form onSubmit={event => { event.preventDefault(); mutation.mutate(); }}><p className="eyebrow">{visit ? "EDITAR VISITA" : "NUEVA VISITA"}</p><h2>{visit ? "¿Cuándo fueron?" : "Registren cuándo fueron"}</h2><p className="muted">La visita se guarda por separado. Después pueden añadir todos los ítems que pidieron.</p><div className="form-columns"><label>Fecha de visita<input type="date" required max={today()} value={visitedOn} onChange={event => setVisitedOn(event.target.value)} /></label><label>Hora aproximada<input type="time" required value={visitedAt} onChange={event => setVisitedAt(event.target.value)} /></label></div><button className="main-button" disabled={mutation.isPending || remove.isPending}>{mutation.isPending ? "Guardando…" : visit ? "Guardar visita" : "Registrar visita"} ✦</button>{visit && <button className="danger-button" type="button" disabled={mutation.isPending || remove.isPending} onClick={() => setConfirmingDelete(true)}>Borrar visita</button>}{(mutation.error || remove.error) && <p className="form-error">{(mutation.error || remove.error)!.message}</p>}</form></Modal>;
}
