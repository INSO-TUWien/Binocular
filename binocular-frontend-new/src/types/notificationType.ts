export enum NotificationType {
  information,
  success,
  warning,
  error,
}

export interface Notification {
  id?: number;
  text: string;
  type: NotificationType;
}
