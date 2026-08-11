import { IMessage } from '../types/IMessage';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IAIServiceConfig {
  apiKey: string;
  studentName: string;
  studentLevel: string;
  currentSubject: string;
  assistantMode?: 'summary' | 'question';
  courseSummary?: string;
}

/**
 * AIService sends chat messages to the Anthropic Claude API.
 */
export class AIService {
  constructor(private config: IAIServiceConfig) {}

  private buildSystemPrompt(): string {
    const modeHint = this.config.assistantMode === 'summary'
      ? 'The learner wants a concise summary of the current document first.'
      : 'The learner wants help asking questions about the current course.';

    return `You are WisdomBank, an institution-controlled academic assistant for ${this.config.studentName}, a ${this.config.studentLevel} student currently studying ${this.config.currentSubject}.
${modeHint}

Your role:
- Answer only curriculum-aligned academic questions
- Keep explanations age-appropriate for a ${this.config.studentLevel} student
- Use simple language, relatable examples, and step-by-step explanations
- Encourage the student to think critically and ask follow-up questions
- If a question is outside the academic curriculum or inappropriate, politely redirect
- Never provide answers to assessments directly — guide the student to the answer instead
- Keep responses concise but thorough (under 300 words unless the topic requires more)`;
  }

  /**
   * Send a list of chat messages to Claude and return the assistant response.
   * @param messages Chat history messages.
   * @returns Assistant response string.
   */
  public async sendMessage(messages: IChatMessage[]): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const payload = {
      model: 'claude-sonnet-4-6',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content }))
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI request failed: ${error}`);
    }

    const data = await response.json();
    return data?.completion?.[0]?.content || 'Sorry, I could not generate a response right now.';
  }
}
