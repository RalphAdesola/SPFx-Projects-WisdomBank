import { useCallback, useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import { NotificationService } from '../services/NotificationService';
import { INotification } from '../types/INotification';

export function useNotifications(sp: SPFI, currentUserId: number) {
  const [data, setData] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setData(await new NotificationService(sp).getNotifications(currentUserId));
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [sp, currentUserId]);

  useEffect(() => {
    refresh().catch(() => undefined);
    const refreshTimer = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 30000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [refresh]);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    const notification = data.find((item) => item.id === notificationId);
    if (!notification || notification.isRead) {
      return;
    }

    setData((current) => current.map((item) =>
      item.id === notificationId ? { ...item, isRead: true } : item
    ));
    try {
      await new NotificationService(sp).markAsRead(Number(notificationId));
    } catch (reason) {
      await refresh();
      throw reason;
    }
  }, [data, sp, refresh]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    const unreadIds = data.filter((item) => !item.isRead).map((item) => item.id);
    if (!unreadIds.length) {
      return;
    }

    setData((current) => current.map((item) => ({ ...item, isRead: true })));
    try {
      await new NotificationService(sp).markAllAsRead(unreadIds.map(Number));
    } catch (reason) {
      await refresh();
      throw reason;
    }
  }, [data, sp, refresh]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = data.find((item) => item.id === notificationId);
    if (!notification || !notification.isRead) {
      return;
    }

    setData((current) => current.filter((item) => item.id !== notificationId));
    try {
      await new NotificationService(sp).deleteNotification(Number(notificationId));
    } catch (reason) {
      await refresh();
      throw reason;
    }
  }, [data, sp, refresh]);

  return {
    data,
    isLoading,
    unreadCount: data.filter((notification) => !notification.isRead).length,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
