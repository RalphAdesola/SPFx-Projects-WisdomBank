import * as React from 'react';
import { IMessage } from '../../types/IMessage';
import styles from './ChatMessage.module.scss';

export interface IChatMessageProps {
  message: IMessage;
}

const ChatMessage: React.FC<IChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.bubble}>
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
