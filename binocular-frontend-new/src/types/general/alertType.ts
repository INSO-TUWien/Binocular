export enum AlertType {
  information,
  success,
  warning,
  error,
}

export interface NotificationType {
  id?: number;
  text: string;
  type: AlertType;
}
