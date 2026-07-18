import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVisit, updateVisit } from "./items";
import { Modal } from "../../components/ui/Modal";
import type { PlaceVisitSummary } from "../../types/domain";

export function VisitForm({ placeId, visit, onClose, onSaved }: { placeId: number; visit?: PlaceVisitSummary; onClose: () => void; onSaved: (visit: PlaceVisitSummary) => void }) {
  const [visitedOn, setVisitedOn] = useState(visit?.visitedOn ?? new Date().toLocaleDateString("sv-SE"));
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => visit ? updateVisit(visit.id, visitedOn) : createVisit(placeId, visitedOn),
    onSuccess: async (saved) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["visits", placeId] }),
        queryClient.invalidateQueries({ queryKey: ["place", placeId] }),
      ]);
      onSaved(saved);
      onClose();
    },
  });
  return <Modal onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}><p className="eyebrow">{visit ? "EDITAR VISITA" : "NUEVA VISITA"}</p><h2>{visit ? "¿Cuándo fueron?" : "¿Cuándo fueron juntos?"}</h2><label>Fecha de visita<input type="date" required value={visitedOn} onChange={(event) => setVisitedOn(event.target.value)} /></label><button className="main-button" disabled={mutation.isPending}>{mutation.isPending ? "Guardando…" : visit ? "Guardar fecha" : "Crear visita"} ✦</button>{mutation.error && <p className="form-error">{mutation.error.message}</p>}</form></Modal>;
}
