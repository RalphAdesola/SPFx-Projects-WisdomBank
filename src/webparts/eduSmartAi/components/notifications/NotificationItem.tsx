import * as React from 'react';
import { IconButton } from '@fluentui/react';
import { INotification } from '../../types/INotification';
import styles from './NotificationItem.module.scss';

export interface INotificationItemProps {
  notification: INotification;
  onClick: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<INotificationItemProps> = ({ notification, onClick, onDelete }) => (
  <div className={`${styles.item} ${notification.isRead ? styles.read : ''}`}>
    <div>
      <button type="button" className={styles.content} onClick={onClick}>
        <h3>{notification.title}</h3>
        <p>{notification.message}</p>
      </button>
    </div>
    <div className={styles.actions}>
      <span>{notification.type}</span>
      {notification.isRead && (
        <IconButton
          className={styles.deleteButton}
          iconProps={{ iconName: 'Delete' }}
          title="Delete notification"
          ariaLabel="Delete notification"
          onClick={onDelete}
        />
      )}
    </div>
  </div>
);

export default NotificationItem;
