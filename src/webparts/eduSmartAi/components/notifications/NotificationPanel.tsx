import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import PageHeader from '../shared/PageHeader';
import NotificationItem from './NotificationItem';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './NotificationPanel.module.scss';

export interface INotificationPanelProps {
  theme: 'dark' | 'light';
}

const NotificationPanel: React.FC<INotificationPanelProps> = ({ theme }) => {
  const { data: user } = useCurrentUser();
  const { data: notifications, isLoading } = useNotifications();

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <PageHeader title="Notifications" subtitle="Recent updates, assignments, and knowledge reminders for your team." theme={theme} />
        <DefaultButton text="Mark all as read" />
      </div>
      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : notifications?.length ? (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onClick={() => {}} />
          ))
        ) : (
          <div className={styles.empty}>No new notifications.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
