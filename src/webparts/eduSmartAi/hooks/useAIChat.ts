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

  const buildResponse = useCallback((text: string): string => {
    const normalized = text.toLowerCase();
    const summary = (config.courseSummary || '').trim();

    if (config.assistantMode === 'summary') {
      if (summary) {
        return summary;
      }

      return 'I could not find a saved summary for this course yet. Please try again after the summary has been added.';
    }

    if (summary) {
      if (normalized.includes('what') || normalized.includes('why') || normalized.includes('how') || normalized.includes('explain')) {
        return `Based on this course, here is the key idea: ${summary}`;
      }

      return `From this course summary, the main takeaway is: ${summary}`;
    }

    if (normalized.includes('summar')) {
      return 'This course summary is not available yet.';
    }
    if (normalized.includes('policy')) {
      return 'This course focuses on responsible handling of company information, approval workflows, and incident reporting.';
    }
    if (normalized.includes('assessment')) {
      return 'I can help you review the key takeaways before your assessment, but I will not give direct answers.';
    }
    if (normalized.includes('simple')) {
      return 'In simple terms: follow the approved process, keep information secure, and escalate concerns promptly.';
    }

    return 'I can help explain the course using the summary stored for this material. Try asking about the main idea, key steps, or why the topic matters.';
  }, [config.assistantMode, config.courseSummary]);

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
      const response = buildResponse(text);

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
  }, [buildResponse, messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcome =
        config.assistantMode === 'summary'
          ? `Here is your course summary.`
          : `Ask me anything about this course and I will help you work through it.`;
      setMessages([
        {
          id: 'welcome-assistant',
          role: 'assistant',
          content: welcome,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [config.assistantMode, messages.length]);

  return { messages, isLoading, error, sendMessage, clearHistory };
}
