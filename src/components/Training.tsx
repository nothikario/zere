import { FormEvent, useState } from 'react';
import { useLanguage } from '../lib/language';
import { askTrainingAssistant } from '../lib/training';

type Message = { role: 'user' | 'assistant'; text: string };

const questions = {
  ru: ['Как создать референс?', 'Как получить звёзды?', 'Как заработать 60 звёзд?', 'Для чего нужен Refri?'],
  en: ['How do I create a reference?', 'How can I earn stars?', 'How can I earn 60 stars?', 'What is Refri for?'],
};

export function Training() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setMessages((all) => [...all, { role: 'user', text: clean }]);
    setQuestion(''); setError(''); setBusy(true);
    try {
      const answer = await askTrainingAssistant(clean, language);
      setMessages((all) => [...all, { role: 'assistant', text: answer }]);
    } catch {
      setError(en ? 'The tutor could not answer. Please try again.' : 'Не удалось получить ответ. Попробуй ещё раз.');
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void ask(question); }

  return <main className="page training-page">
    <div className="eyebrow">{en ? 'REFRI TUTOR' : 'ОБУЧЕНИЕ REFRI'}</div>
    <h1>{en ? <>Learn how <em>everything works</em></> : <>Узнай, как <em>всё работает</em></>}</h1>
    <p className="lead">{en ? 'Choose a question or ask the AI tutor anything about the app.' : 'Выбери вопрос или спроси AI-помощника о приложении.'}</p>
    <div className="training-layout"><aside className="training-questions"><h2>{en ? 'Popular questions' : 'Популярные вопросы'}</h2>{questions[language].map((item) => <button key={item} disabled={busy} onClick={() => void ask(item)}>{item}<span>→</span></button>)}</aside>
      <section className="training-chat"><div className="training-messages">{messages.length ? messages.map((message, index) => <div key={`${message.role}-${index}`} className={`training-message ${message.role}`}>{message.text}</div>) : <div className="training-empty"><span>✦</span><p>{en ? 'Your AI tutor is ready to help.' : 'AI-помощник готов помочь.'}</p></div>}{busy && <div className="training-message assistant">{en ? 'Thinking…' : 'Думаю…'}</div>}</div>
        <form className="training-form" onSubmit={submit}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={en ? 'Ask about Refri…' : 'Спроси о Refri…'} maxLength={500}/><button disabled={busy || !question.trim()}>{en ? 'Ask' : 'Спросить'}</button></form>{error && <p className="message">{error}</p>}
      </section></div>
  </main>;
}
