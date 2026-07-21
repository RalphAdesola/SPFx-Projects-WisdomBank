import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useAIChat } from '../../hooks/useAIChat';
import { IAIServiceConfig } from '../../services/AIService';
import styles from './AIAssistant.module.scss';

export interface IAIAssistantProps {
  apiKey: string;
  studentName: string;
  studentLevel: string;
  currentSubject: string;
}

const AIAssistant: React.FC<IAIAssistantProps> = ({ apiKey, studentName, studentLevel, currentSubject }) => {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAIChat({ apiKey, studentName, studentLevel, currentSubject });
  const [draft, setDraft] = React.useState('');

  const handleSend = async () => {
    if (draft.trim().length === 0) return;
    await sendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div className={styles.assistantContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Enterprise Context</div>
        <div className={styles.contextItem}>Learning Category: {currentSubject}</div>
        <div className={styles.contextItem}>Employee Level: {studentLevel}</div>
        <div className={styles.suggestions}>
          <span>Summarize this document</span>
          <span>Explain this policy</span>
          <span>Prepare me for the assessment</span>
        </div>
      </div>
      <div className={styles.chatPanel}>
        <div className={styles.headerBar}>
          <h2>Enterprise Learning Assistant</h2>
          <DefaultButton text="Clear" onClick={clearHistory} />
        </div>
        <div className={styles.chatHistory}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          {error && <div className={styles.errorText}>{error.message}</div>}
        </div>
        <ChatInput value={draft} onChange={setDraft} onSend={handleSend} canSend={draft.trim().length > 0} />
      </div>
    </div>
  );
};

export default AIAssistant;
