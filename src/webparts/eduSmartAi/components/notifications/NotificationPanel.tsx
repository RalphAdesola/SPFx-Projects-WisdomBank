import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import PageHeader from '../shared/PageHeader';
import NotificationItem from './NotificationItem';
import { INotification } from '../../types/INotification';
import styles from './NotificationPanel.module.scss';

export interface INotificationPanelProps {
  theme: 'dark' | 'light';
  notifications: INotification[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationPanel: React.FC<INotificationPanelProps> = ({
  theme,
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <PageHeader title="Notifications" subtitle="Recent updates, assignments, and knowledge reminders for your team." theme={theme} />
        <DefaultButton
          text="Mark all as read"
          disabled={unreadCount === 0}
          onClick={() => onMarkAllAsRead().catch(() => undefined)}
        />
      </div>
      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : notifications?.length ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => onMarkAsRead(notification.id).catch(() => undefined)}
              onDelete={() => onDeleteNotification(notification.id).catch(() => undefined)}
            />
          ))
        ) : (
          <div className={styles.empty}>No new notifications.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
