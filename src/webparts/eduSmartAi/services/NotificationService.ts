import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { INotification } from '../types/INotification';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface INotificationListItem {
  Id: number;
  Title?: string;
  Titles?: string;
  Message?: string;
  NotificationType?: string;
  IsRead?: boolean;
  Created?: string;
  DueDate?: string;
  TargetEmployeeId?: number;
}

export class NotificationService {
  constructor(private readonly sp: SPFI) {}

  public async getNotifications(currentUserId: number): Promise<INotification[]> {
    let query = this.sp.web.lists
      .getByTitle(SHAREPOINT_LISTS.notifications)
      .items
      .select(
        'Id',
        'Title',
        'Titles',
        'Message',
        'NotificationType',
        'IsRead',
        'Created',
        'DueDate',
        'TargetEmployeeId'
      )
      .orderBy('Created', false)
      .top(100);
    if (currentUserId > 0) {
      query = query.filter(`TargetEmployeeId eq ${currentUserId}`);
    }
    const items = await query() as INotificationListItem[];

    return items.map((item) => ({
      id: item.Id.toString(),
      studentId: item.TargetEmployeeId?.toString() ?? '',
      title: item.Titles || item.Title || 'Notification',
      message: item.Message || '',
      type: item.NotificationType || 'System',
      isRead: !!item.IsRead,
      createdDate: item.Created,
      dueDate: item.DueDate
    }));
  }

  public async markAsRead(notificationId: number): Promise<void> {
    await this.sp.web.lists
      .getByTitle(SHAREPOINT_LISTS.notifications)
      .items
      .getById(notificationId)
      .update({ IsRead: true });
  }

  public async markAllAsRead(notificationIds: number[]): Promise<void> {
    await Promise.all(notificationIds.map((notificationId) => this.markAsRead(notificationId)));
  }

  public async deleteNotification(notificationId: number): Promise<void> {
    await this.sp.web.lists
      .getByTitle(SHAREPOINT_LISTS.notifications)
      .items
      .getById(notificationId)
      .delete();
  }
}
