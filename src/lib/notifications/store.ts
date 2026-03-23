export interface Notification {
  type: string;
  message: string;
  fromEducator?: boolean;
  createdAt: string;
}

const pendingNotifications = new Map<string, Notification[]>();

export function pushNotification(userId: string, notification: Notification) {
  const existing = pendingNotifications.get(userId) || [];
  existing.push(notification);
  pendingNotifications.set(userId, existing);
}

export function popNotifications(userId: string): Notification[] {
  const notifications = pendingNotifications.get(userId) || [];
  pendingNotifications.delete(userId);
  return notifications;
}
