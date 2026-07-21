import * as React from 'react';
import { TextField, IconButton } from '@fluentui/react';
import styles from './ChatInput.module.scss';

export interface IChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
}

const ChatInput: React.FC<IChatInputProps> = ({ value, onChange, onSend, canSend }) => (
  <div className={styles.inputBar}>
    <TextField
      multiline
      autoAdjustHeight
      placeholder="Ask your AI tutor a question..."
      value={value}
      onChange={(_, newValue) => onChange(newValue || '')}
      aria-label="Ask your AI tutor a question"
    />
    <IconButton iconProps={{ iconName: 'Send' }} onClick={onSend} disabled={!canSend} aria-label="Send message" />
  </div>
);

export default ChatInput;
