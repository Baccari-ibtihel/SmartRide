export interface Rating {
  id: number;
  tripId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  score: number;
  comment: string;
  createdAt: string;
}
