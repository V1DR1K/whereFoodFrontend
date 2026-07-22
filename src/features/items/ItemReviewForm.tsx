import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveItemReview } from "./items";
import { Modal } from "../../components/ui/Modal";
import { StarRating } from "../../components/ui/StarRating";
import type { Item, ItemReview } from "../../types/domain";
import { showNotice } from "../../lib/flash";

export function ItemReviewForm({ item, review, placeId, visitId, onClose }: { item: Item; review?: ItemReview; placeId: number; visitId: number; onClose: () => void }) {
  const [scores, setScores] = useState({ taste: review?.taste ?? 4, price: review?.price ?? 4 });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (form: FormData) => saveItemReview(item.id, { comment: String(form.get("comment")) || undefined, ...scores }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["places"] }),
        queryClient.invalidateQueries({ queryKey: ["visit", visitId] }),
        queryClient.invalidateQueries({ queryKey: ["place", placeId] }),
      ]);
      showNotice(review ? "Actualizamos tu reseña." : "Guardamos tu reseña.");
      onClose();
    },
  });
  return <Modal onClose={onClose} confirmDiscard pending={mutation.isPending}><form onSubmit={(event) => { event.preventDefault(); mutation.mutate(new FormData(event.currentTarget)); }}><p className="eyebrow">MI RESEÑA</p><h2>{item.name}</h2><label>Comentario<textarea name="comment" defaultValue={review?.comment} placeholder="Tu observación honesta…" /></label><div className="score-grid">{(["taste", "price"] as const).map((key) => <label className="score-field" key={key}>{key === "taste" ? "😋 Sabor" : "💸 Precio"}<StarRating label={key} value={scores[key]} onChange={(value) => setScores({ ...scores, [key]: value })} /></label>)}</div><button className="main-button" disabled={mutation.isPending}>{mutation.isPending ? "Guardando…" : "Guardar mi reseña"} ✦</button>{mutation.error && <p className="form-error">{mutation.error.message}</p>}</form></Modal>;
}
