import { useState, useCallback } from 'react';
import { parseUserInputWithGemini } from '../services/geminiService';
import { Event } from '../types.ts';

export interface ChatMessage {
  role: 'user' | 'model' | 'loading';
  content: string;
  suggestedEvents?: Event[];
}

export const useEventChatbot = (allEvents: Event[], onSuggestedEventsChange?: (events: Event[]) => void, onFilterActiveChange?: (isActive: boolean) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Hi! 👋 I\'m your AI Event Assistant. Ask me anything about finding events!'
    }
  ]);

  const handleSendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Add loading state
    setMessages(prev => [...prev, { role: 'loading', content: '' }]);

    try {
      const matchingEventIds = await parseUserInputWithGemini(userMessage, allEvents);
      
      // Filter events based on returned IDs
      const suggestedEvents = allEvents.filter(event => 
        matchingEventIds.includes(event.id)
      );

      // Notify parent component of suggested events
      if (onSuggestedEventsChange) {
        onSuggestedEventsChange(suggestedEvents);
      }

      // Notify that chatbot filter is active
      if (onFilterActiveChange) {
        onFilterActiveChange(suggestedEvents.length > 0);
      }

      // Create a user-friendly message about the results
      const resultMessage = suggestedEvents.length > 0
        ? `Found ${suggestedEvents.length} event(s) matching your interest! 📍`
        : 'No events found matching your criteria. Try a different search! 🔍';

      // Replace loading message with result
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'model', 
          content: resultMessage,
          suggestedEvents: suggestedEvents
        };
        return updated;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'model',
          content: '⚠️ Sorry, something went wrong. Please try again.'
        };
        return updated;
      });
      if (onSuggestedEventsChange) {
        onSuggestedEventsChange([]);
      }
      if (onFilterActiveChange) {
        onFilterActiveChange(false);
      }
    }
  }, [allEvents, onSuggestedEventsChange, onFilterActiveChange]);

  return { messages, handleSendMessage };
};
