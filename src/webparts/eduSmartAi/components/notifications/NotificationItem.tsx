import * as React from 'react';
import { INotification } from '../../types/INotification';
import styles from './NotificationItem.module.scss';

export interface INotificationItemProps {
  notification: INotification;
  onClick: () => void;
}

const NotificationItem: React.FC<INotificationItemProps> = ({ notification, onClick }) => (
  <button type="button" className={`${styles.item} ${notification.isRead ? styles.read : ''}`} onClick={onClick}>
    <div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
    </div>
    <span>{notification.type}</span>
  </button>
);

export default NotificationItem;
