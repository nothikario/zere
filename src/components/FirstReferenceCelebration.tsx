import { useLanguage } from '../lib/language';

export function FirstReferenceCelebration({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  const en = language === 'en';
  return <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
    <section className="celebration-card">
      <div className="falling-star" aria-hidden="true">★</div>
      <div className="star-glow" aria-hidden="true">✦</div>
      <h2 id="celebration-title">{en ? 'Your first reference is ready!' : 'Твой первый референс готов!'}</h2>
      <p>{en ? 'Congratulations on your first creation! It is now saved in your collection.' : 'Поздравляем с первым созданием! Теперь оно сохранено в твоей коллекции.'}</p>
      <button type="button" onClick={onClose}>{en ? 'View my references' : 'Посмотреть мои референсы'} →</button>
    </section>
  </div>;
}
