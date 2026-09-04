import * as React from 'react';
import { IconButton, Spinner, SpinnerSize } from '@fluentui/react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useAIChat } from '../../hooks/useAIChat';
import { SPFI } from '@pnp/sp';
import { AssistantSummaryService } from '../../services/AssistantSummaryService';
import { ICourse } from '../../types/ICourse';
import styles from './AIAssistant.module.scss';

export interface IAIAssistantProps {
  sp: SPFI;
  apiKey: string;
  studentName: string;
  studentLevel: string;
  currentSubject: string;
  assistantMode: 'summary' | 'question';
  course?: ICourse;
}

const AIAssistant: React.FC<IAIAssistantProps> = ({
  sp,
  apiKey,
  studentName,
  studentLevel,
  currentSubject,
  assistantMode,
  course
}) => {
  const [courseSummary, setCourseSummary] = React.useState('');
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const { messages, isLoading, error, sendMessage, clearHistory } = useAIChat({
    apiKey,
    studentName,
    studentLevel,
    currentSubject,
    assistantMode,
    courseSummary
  });
  const [draft, setDraft] = React.useState('');

  React.useEffect(() => {
    if (!course) {
      setCourseSummary('');
      return;
    }

    let cancelled = false;
    setSummaryLoading(true);

    new AssistantSummaryService(sp)
      .getSummary(course)
      .then((value) => {
        if (!cancelled) {
          setCourseSummary(value);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assistantMode, course, sp]);

  const handleSend = async () => {
    if (draft.trim().length === 0) return;
    await sendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div className={styles.assistantContainer}>
      <div className={styles.chatPanel}>
        <div className={styles.headerBar}>
          <div>
            <h2>Employee Learning AI</h2>
            <div className={styles.headerSubtext}>{course?.title || currentSubject}</div>
          </div>
          <IconButton
            iconProps={{ iconName: 'Clear' }}
            ariaLabel="Clear conversation"
            title="Clear conversation"
            onClick={clearHistory}
          />
        </div>
        <div className={styles.chatHistory}>
          {assistantMode === 'summary' && summaryLoading ? (
            <div className={styles.summaryBanner}>
              <Spinner size={SpinnerSize.medium} label="Loading course summary..." />
            </div>
          ) : null}
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
