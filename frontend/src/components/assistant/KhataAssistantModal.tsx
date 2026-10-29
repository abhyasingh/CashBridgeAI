import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, Bot, User, Mic } from 'lucide-react';
import { LedgerButton } from '../common/LedgerButton';
import { apiRequest } from '../../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface KhataAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KhataAssistantModal: React.FC<KhataAssistantModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: isHindi
        ? 'नमस्ते रमेश जी! मैं आपका खाता AI सहायक हूँ। अपने कैश-फ्लो, लेट पेमेंट्स या ब्रिज लोन के बारे में कुछ भी पूछें।'
        : 'Namaste Ramesh ji! I am your Khata AI assistant. Ask me anything about your 13-week cash forecast, delayed customer invoices, or the bridge loan.',
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await apiRequest<{ answer: string }>(
        '/assistant/ask',
        {
          method: 'POST',
          body: JSON.stringify({
            question: textToSend,
            language: isHindi ? 'hi' : 'en',
            businessId: 'MSME0002',
          }),
        },
        {
          answer: isHindi
            ? `आपके खाते के विश्लेषण अनुसार: शर्मा गारमेंट्स का वर्तमान बैंक बैलेंस ₹4,85,000 है। 18वें दिन ₹2.1 लाख की कमी आएगी जिसे शिवालिक बैंक के ₹2.3 लाख के 1-टैप ब्रिज लोन से सुरक्षित किया जा सकता है।`
            : `Based on Sharma Garments' 12-month ledger: current bank balance is ₹4,85,000. Day 18 has a projected ₹2.1L deficit which can be bridged via the pre-approved Shivalik Bank facility.`,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: res.data.answer,
          time: 'Now',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: isHindi ? 'सर्वर से जुड़ने में असमर्थ।' : 'Unable to connect to assistant service.',
          time: 'Now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions = [
    { label: t('assistant.q1'), key: 'q1' },
    { label: t('assistant.q2'), key: 'q2' },
    { label: t('assistant.q3'), key: 'q3' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
    >
      <div className="bg-[#F7F4EC] border-2 border-paper-line rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header with Ledger Title */}
        <div className="px-5 py-4 border-b border-paper-ruled bg-paper-subtle/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-saffron text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="assistant-title" className="font-serif font-bold text-ink-primary text-base leading-tight">
                {t('assistant.title')}
              </h2>
              <p className="text-xs text-ink-muted">
                {t('assistant.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-paper-subtle transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-paper-bg ledger-ruled-bg">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-[2px] bg-ink-primary text-saffron flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-[4px] px-3.5 py-2.5 text-xs sm:text-sm border ${
                  m.sender === 'user'
                    ? 'bg-ink-primary text-[#F7F4EC] border-ink-primary'
                    : 'bg-white/95 text-ink-primary border-paper-line shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                <span className={`block text-[10px] mt-1 ${m.sender === 'user' ? 'text-gray-400 text-right' : 'text-ink-muted'}`}>
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-[2px] bg-paper-subtle text-ink-primary border border-paper-line flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-ink-muted text-xs italic pl-9">
              <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce [animation-delay:0.4s]" />
              <span>Khata AI is analyzing ledger records...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-paper-ruled bg-paper-subtle/40 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider self-center mr-1">
            {t('assistant.suggestionsTitle')}
          </span>
          {sampleQuestions.map((sq) => (
            <button
              key={sq.key}
              type="button"
              onClick={() => handleSend(sq.label)}
              className="text-xs bg-white hover:bg-paper-subtle text-ink-secondary border border-paper-line rounded px-2.5 py-1 text-left transition-colors shadow-2xs"
            >
              {sq.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-paper-ruled bg-paper-subtle/80 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('assistant.placeholder')}
              className="w-full text-xs sm:text-sm pl-3 pr-9 py-2.5 bg-white border border-paper-line rounded focus:outline-none focus:ring-1 focus:ring-saffron text-ink-primary placeholder:text-ink-muted/70"
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-ink-muted hover:text-saffron p-0.5"
              title="Voice Input (Mic simulation)"
              onClick={() => setInputQuery('Kapoor Retailers payment date')}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <LedgerButton
            variant="saffron"
            size="md"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            {t('assistant.send')}
          </LedgerButton>
        </div>
      </div>
    </div>
  );
};
