import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';

export function ReviewPrompt({ name, reviewTo, onClose }: { name: string; reviewTo: string; onClose: () => void }) {
  const navigate = useNavigate();
  return <Modal onClose={onClose}><div className="review-prompt"><p className="eyebrow">NUEVO PLAN GUARDADO</p><h2>{name} ya está en la lista</h2><p>¿Ya lo disfrutaron? Pueden dejar su reseña ahora o hacerlo más tarde.</p><button className="main-button" onClick={() => navigate(reviewTo)}>Reseñar ahora</button><button className="secondary-button" onClick={onClose}>Más tarde</button></div></Modal>;
}
