export interface INotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdDate?: string;
  dueDate?: string;
  actionURL?: string;
}
