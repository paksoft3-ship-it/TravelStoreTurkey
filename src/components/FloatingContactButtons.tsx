'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone, X, Send, Bot, User, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

// WhatsApp icon as SVG component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
}

const quickReplies = [
  'Book a taxi',
  'Airport transfer',
  'Tour information',
  'Pricing',
  'Contact support',
];

const botResponses: Record<string, string> = {
  'book a taxi': 'I can help you book a private taxi! You can book online at /booking or message us on WhatsApp at +90 530 123 45 67 for immediate assistance.',
  'airport transfer': 'Our private airport transfers from Istanbul Airport (IST) and Sabiha Gökçen (SAW) to your hotel start from €45. We offer meet & greet and flight monitoring. Would you like to book?',
  'tour information': 'We offer guided Turkey packages including our 6 Days Turkey Tour (Gallipoli, Troy, Ephesus, Pamukkale & Cappadocia) from €1,520, plus Istanbul and Cappadocia day tours. Check our /tours page for details!',
  'pricing': 'Our pricing:\n• Airport Transfer: from €45\n• 6 Days Turkey Tour: from €1,520\n• Private day tours: from €99\nVisit /tours for full details.',
  'contact support': 'You can reach us:\n• Phone: +90 530 123 45 67 (24/7)\n• Email: booking@travelstoreturkey.com\n• WhatsApp: +90 530 123 45 67\nOr fill out our contact form at /contact',
  'default': 'Thanks for your message! For immediate assistance, please call us at +90 530 123 45 67 or use our booking page. Our team will respond to your inquiry shortly.',
};

export function FloatingContactButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! 👋 Welcome to TravelStore Turkey. How can I help you today?',
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-buttons-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen && !showChat) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, showChat]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Desktop Floating Buttons */}
      <div className="floating-buttons-container fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-3">
        {/* Expanded Buttons */}
        <div
          className={cn(
            'flex flex-col gap-3 transition-all duration-300',
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {/* Chat Button */}
          <button
            onClick={() => {
              setShowChat(true);
              setIsOpen(false);
            }}
            className="group flex items-center gap-3 pl-4 pr-3 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all"
          >
            <span className="text-sm font-medium">Live Chat</span>
            <div className="size-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-slate-600">
              <Bot className="size-5" />
            </div>
          </button>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/3548575955?text=Hello!%20I%20would%20like%20to%20book%20a%20ride."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 pl-4 pr-3 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all"
          >
            <span className="text-sm font-medium">WhatsApp</span>
            <div className="size-10 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700">
              <WhatsAppIcon className="size-5" />
            </div>
          </a>

          {/* Phone Button */}
          <a
            href="tel:+905301234567"
            className="group flex items-center gap-3 pl-4 pr-3 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            <span className="text-sm font-medium">Call Now</span>
            <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700">
              <Phone className="size-5" />
            </div>
          </a>
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'size-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
            isOpen
              ? 'bg-slate-800 text-white rotate-45'
              : 'bg-primary text-black hover:bg-yellow-400'
          )}
        >
          {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[380px] h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Chat Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-black/10 rounded-full flex items-center justify-center">
                <Bot className="size-5 text-black" />
              </div>
              <div>
                <h4 className="font-bold text-black text-sm">TravelStore Turkey Assistant</h4>
                <p className="text-xs text-black/70">Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="size-8 rounded-full bg-black/10 flex items-center justify-center text-black hover:bg-black/20 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex gap-2', message.isBot ? 'justify-start' : 'justify-end')}
              >
                {message.isBot && (
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="size-4 text-black" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] px-4 py-2 rounded-2xl',
                    message.isBot
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none shadow-sm'
                      : 'bg-primary text-black rounded-tr-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={cn('text-[10px] mt-1', message.isBot ? 'text-slate-400' : 'text-black/60')}>
                    {message.time}
                  </p>
                </div>
                {!message.isBot && (
                  <div className="size-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center shrink-0">
                    <User className="size-4 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="size-4 text-black" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-primary hover:text-black transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:border-primary dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="size-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-2 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Call */}
          <a
            href="tel:+905301234567"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Phone className="size-6" />
            <span className="text-[10px] font-medium">Call</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/3548575955"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <WhatsAppIcon className="size-6" />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>

          {/* Book Now - Main CTA */}
          <a
            href="/booking"
            className="-mt-5 flex flex-col items-center justify-center gap-1 bg-primary text-black rounded-2xl shadow-[0_4px_20px_rgba(234,179,8,0.5)] hover:bg-yellow-400 active:scale-95 transition-all px-5 py-3 min-w-[88px] border-2 border-yellow-300/80 ring-2 ring-white"
          >
            <CalendarDays className="size-5 stroke-[2.5]" />
            <span className="text-[11px] font-extrabold tracking-wide leading-none">Book Now</span>
          </a>

          {/* Chat */}
          <button
            onClick={() => setShowChat(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bot className="size-6" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>

          {/* Menu/More */}
          <a
            href="/contact"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageCircle className="size-6" />
            <span className="text-[10px] font-medium">Contact</span>
          </a>
        </div>
      </div>
    </>
  );
}
