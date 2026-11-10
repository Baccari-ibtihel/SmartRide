export interface Trip {
  id: number;
  driverId: number;
  driverName: string;
  driverRating?: number;
  driverAvatar?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: 'ACTIF' | 'COMPLET' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  description?: string;
  matchScore?: number;
  distance?: string;
  duration?: string;
  createdAt: string;
}
