import { useCallback, useEffect, useState } from 'react';
import { IAIServiceConfig } from '../services/AIService';
import { IMessage } from '../types/IMessage';

export interface IAIChatResult {
  messages: IMessage[];
  isLoading: boolean;
  error?: Error;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

/**
 * Hook to manage AI chat state and calls.
 * @param config AI service configuration.
 */
export function useAIChat(config: IAIServiceConfig): IAIChatResult {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(undefined);
    const userMessage: IMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const normalized = text.toLowerCase();
      let response = 'I can help summarize policies, explain document sections, and prepare you for assessments.';
      if (normalized.includes('summar')) {
        response = 'Here is a concise summary: the material highlights compliance expectations, secure collaboration, and the review steps required before submission.';
      } else if (normalized.includes('policy')) {
        response = 'This policy focuses on responsible handling of company information, approval workflows, and incident reporting.';
      } else if (normalized.includes('assessment')) {
        response = 'I have prepared a short practice set for the assessment, focused on the key takeaways from this material.';
      } else if (normalized.includes('simple')) {
        response = 'In simple terms: follow the approved process, keep information secure, and escalate concerns promptly.';
      }

      const assistantMessage: IMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-assistant',
          role: 'assistant',
          content: `Hi there, I am your Enterprise Learning Assistant. I can summarize documents, explain policies, and prepare you for assessments.`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);

  return { messages, isLoading, error, sendMessage, clearHistory };
}
