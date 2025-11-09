import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../hooks/useEventChatbot';
import { Event } from '../types';
import XIcon from './icons/XIcon';

interface ChatbotSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onEventClick?: (event: Event) => void;
  isChatbotFilterActive?: boolean;
  onClearFilter?: () => void;
}

const ChatbotSidePanel: React.FC<ChatbotSidePanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onEventClick,
  isChatbotFilterActive,
  onClearFilter
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-gray-800/40 backdrop-blur-md border-r border-white/20 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-white/20 bg-gray-800/30 backdrop-blur-md">
            <h2 id="chatbot-title" className="text-lg sm:text-xl font-bold">
              AI Assistant
            </h2>
            <button
              onClick={onClose}
              className="bg-gray-700/50 rounded-full p-2 hover:bg-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90"
              aria-label="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-gray-900/40 backdrop-blur-md">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'loading' ? (
                  <div
                    className="bg-purple-600/50 text-white p-2 sm:p-3 rounded-lg max-w-xs sm:max-w-sm inline-flex items-center"
                    aria-label="AI is typing"
                  >
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                      <div
                        className="w-2 h-2 bg-purple-200 rounded-full"
                        style={{ animationDelay: '200ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-200 rounded-full"
                        style={{ animationDelay: '400ms' }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:gap-3 max-w-xs sm:max-w-sm">
                    <div
                      className={`p-2 sm:p-3 rounded-lg whitespace-pre-wrap break-words text-sm sm:text-base ${
                        msg.role === 'user' ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.suggestedEvents && msg.suggestedEvents.length > 0 && (
                      <div className="space-y-2">
                        {msg.suggestedEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (onEventClick) {
                                onEventClick(event);
                              }
                            }}
                            className="bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ease-out transform border-l-4 border-purple-500 hover:scale-105 hover:shadow-lg hover:border-purple-400"
                          >
                            <h4 className="font-semibold text-xs sm:text-sm line-clamp-1">{event.title}</h4>
                            <p className="text-xs text-gray-300 line-clamp-2">{event.description}</p>
                            <div className="flex justify-between items-center mt-2 text-xs gap-1">
                              <span className="text-purple-300 truncate">{event.category}</span>
                              <span className="text-gray-400 whitespace-nowrap">{event.isFree ? '🎉 Free' : '💰 Paid'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-2 sm:p-4 border-t border-white/20 bg-gray-800/30 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 text-sm sm:text-base"
                aria-label="Your message"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold p-2 sm:p-3 rounded-lg transition-all duration-300 disabled:opacity-50 backdrop-blur-md border border-purple-400/50 shadow-md hover:shadow-lg hover:shadow-purple-500/30"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotSidePanel;