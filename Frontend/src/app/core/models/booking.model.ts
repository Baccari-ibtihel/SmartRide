export interface Booking {
  id: number;
  tripId: number;
  passengerId: number;
  passengerName: string;
  driverName?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  seats: number;
  totalPrice: number;
  status: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';
  createdAt: string;
}
