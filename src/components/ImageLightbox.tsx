import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../lib/language';

export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const en = useLanguage().language === 'en';
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  return createPortal(<div className="image-lightbox" role="dialog" aria-modal="true" aria-label={en ? 'Full-size image' : 'Изображение в полном размере'} onClick={onClose}><button aria-label={en ? 'Close' : 'Закрыть'}>×</button><img src={src} alt={alt} onClick={(event) => event.stopPropagation()}/></div>, document.body);
}
