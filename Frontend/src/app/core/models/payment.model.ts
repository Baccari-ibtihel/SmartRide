export interface Payment {
  id: number;
  bookingId: number;
  userId?: number;
  userName?: string;
  amount: number;
  method: 'CARTE' | 'FLOUCI' | 'D17' | 'ESPECES';
  status: 'PAYE' | 'EN_ATTENTE' | 'REMBOURSE' | 'ECHOUE';
  transactionId?: string;
  createdAt: string;
}
