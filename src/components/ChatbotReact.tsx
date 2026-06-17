import React, { useState, useCallback, useRef, useId } from 'react';
import type { ChatbotProps, ChatbotMessage, ChatbotSender } from '../types/components';

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR DE RÉPONSES (règles simples par mots-clés)
// ─────────────────────────────────────────────────────────────────────────────
function getBotResponse(input: string): string {
  const text = input.toLowerCase().trim();

  if (text.match(/bonjour|salut|hello|coucou|bonsoir/))
    return '👋 Bonjour ! Que puis-je faire pour vous aujourd\'hui ?';
  if (text.match(/prix|tarif|coût|cout|combien|budget/))
    return '💰 Nos tarifs débutent à 1\'500 CHF pour un site vitrine. Souhaitez-vous un devis personnalisé ?';
  if (text.match(/contact|téléphone|telephone|appel|rappel/))
    return '📞 Vous pouvez nous joindre au +41 78 823 89 50 ou via le formulaire de contact ci-dessous.';
  if (text.match(/seo|référencement|referencement|google|visibilité|visibilite/))
    return '📍 Nous spécialisons le SEO local pour les PME de Suisse romande. Résultats mesurables sous 90 jours.';
  if (text.match(/site|web|internet|création|creation|développement|developpement/))
    return '🌐 Nous créons des sites rapides, sécurisés et conformes nLPD. Audit gratuit disponible !';
  if (text.match(/délai|delai|durée|duree|temps|quand/))
    return '⏱️ Un site vitrine est livré en 3 à 5 semaines. Un projet sur-mesure en 6 à 10 semaines.';
  if (text.match(/nlpd|loi|conformité|conformite|rgpd|données|donnees/))
    return '🔐 Tous nos sites sont conformes à la nLPD suisse. La sécurité des données de vos clients est notre priorité.';
  if (text.match(/merci|parfait|super|génial|genial|ok/))
    return '😊 Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.';

  return '🤔 Je n\'ai pas bien compris votre question. Pouvez-vous reformuler, ou contactez-nous directement via le formulaire.';
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ChatbotReact: React.FC<ChatbotProps> = ({
  position = 'bottom-right',
  greeting  = 'Bonjour 👋 Je suis l\'assistant CLICOM. Comment puis-je vous aider ?',
}) => {
  const chatId                              = useId();
  const [open, setOpen]                     = useState<boolean>(false);
  const [messages, setMessages]             = useState<ChatbotMessage[]>([
    { id: makeId(), text: greeting, sender: 'bot' as ChatbotSender, timestamp: Date.now() },
  ]);
  const [input, setInput]                   = useState<string>('');
  const [isTyping, setIsTyping]             = useState<boolean>(false);
  const messagesEndRef                      = useRef<HTMLDivElement>(null);
  const inputRef                            = useRef<HTMLInputElement>(null);
  const typingTimerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyage du timer de saisie au démontage
  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll vers le dernier message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus sur l'input quand la modale s'ouvre
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatbotMessage = {
      id:        makeId(),
      text,
      sender:    'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    typingTimerRef.current = setTimeout(() => {
      const botMsg: ChatbotMessage = {
        id:        makeId(),
        text:      getBotResponse(text),
        sender:    'bot',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const positionClass = position === 'bottom-left'
    ? 'bottom-6 left-6'
    : 'bottom-6 right-6';

  return (
    <div
      className={`fixed z-[60] flex flex-col items-end gap-3 ${positionClass}`}
      aria-label="Assistant CLICOM"
    >
      {/* ── Fenêtre de chat ── */}
      <div
        id={`${chatId}-dialog`}
        role="dialog"
        aria-label="Chat avec l'assistant CLICOM"
        aria-modal="false"
        className={[
          'w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden',
          'bg-brand-dark border border-border shadow-glass',
          'transition-all duration-300 origin-bottom-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
        style={{ maxHeight: '480px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-dark-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" aria-hidden="true" />
            <p className="text-sm font-bold text-white">Assistant CLICOM</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le chat"
            className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4 bg-brand-dark"
          aria-live="polite"
          aria-atomic="false"
          role="log"
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={[
                'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                msg.sender === 'user'
                  ? 'self-end bg-lime text-brand-dark font-medium rounded-br-sm'
                  : 'self-start bg-brand-dark-2 border border-border text-gray-300 rounded-bl-sm',
              ].join(' ')}
            >
              {msg.text}
            </div>
          ))}

          {/* Indicateur de saisie du bot */}
          {isTyping && (
            <div className="self-start bg-brand-dark-2 border border-border px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5" aria-label="L'assistant est en train de répondre">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Zone de saisie */}
        <div className="flex items-center gap-2 px-3 py-3 bg-brand-dark-2 border-t border-border flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question…"
            className="flex-1 bg-brand-dark border border-border text-white text-sm rounded-xl px-3.5 py-2.5 placeholder-gray-600 focus:outline-none focus:border-lime/50 transition-colors"
            aria-label="Message à envoyer"
            maxLength={300}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            aria-label="Envoyer"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-lime text-brand-dark rounded-xl hover:bg-lime-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bouton toggle ── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        aria-expanded={open}
        aria-controls={`${chatId}-dialog`}
        className={[
          'w-14 h-14 rounded-full flex items-center justify-center',
          'bg-lime text-brand-dark shadow-lime-lg',
          'hover:bg-lime-hover hover:scale-110 transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
        ].join(' ')}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatbotReact;