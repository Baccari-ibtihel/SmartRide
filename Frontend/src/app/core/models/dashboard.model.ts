export interface DashboardStats {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageRating: number;
  matchSuccessRate: number;
  userGrowth: number;
  revenueGrowth: number;
}

export interface RevenueData {
  month: string;
  amount: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string;
  detail: string;
  time: string;
  type: 'user' | 'trip' | 'booking' | 'payment' | 'system';
}
