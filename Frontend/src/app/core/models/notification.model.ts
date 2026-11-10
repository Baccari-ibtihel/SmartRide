export interface AppNotification {
  id: number;
  userId?: number;
  title: string;
  message: string;
  type: 'BOOKING' | 'TRIP' | 'PAYMENT' | 'SYSTEM' | 'RATING';
  isRead: boolean;
  createdAt: string;
}
