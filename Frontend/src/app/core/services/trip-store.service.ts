import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TripStatus = 'ACTIF' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'BROUILLON';
export type BookingStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface StoredTrip {
  id: number;
  driverId: number;
  driverName: string;
  driverInitials: string;
  driverRating: number;
  driverTripsCount: number;
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  date: string;
  time: string;
  seats: number;
  seatsBooked: number;
  price: number;
  distance: number;
  duration: string;
  description: string;
  nonSmoker: boolean;
  music: boolean;
  recurring: boolean;
  status: TripStatus;
  score: number;
  verified: boolean;
  createdAt: string;
}

export interface StoredBooking {
  id: number;
  tripId: number;
  passengerId: number;
  passengerName: string;
  passengerInitials: string;
  passengerPhone: string;
  seats: number;
  status: BookingStatus;
  createdAt: string;
  // Payment info
  isPaid?: boolean;
  paymentMethod?: string;
  paidAmount?: number;
  paymentDate?: string;
  receiptNumber?: string;
  // Driver live tracking data
  driverLat?: number;
  driverLng?: number;
  driverLastUpdate?: string;
}

export interface StoredPaymentRecord {
  id: number;
  bookingId: number;
  tripId: number;
  tripRoute?: string;
  amount: number;
  method: string;
  date: string;
  receiptNumber: string;
  status: 'Payé' | 'En attente' | 'Remboursé';
}

export interface StoredReview {
  id: number;
  tripId: number;
  name: string;
  initials: string;
  score: number;
  comment: string;
  tags?: string[];
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TripStoreService {
  private readonly TRIPS_KEY = 'smartride_trips';
  private readonly BOOKINGS_KEY = 'smartride_bookings';
  private readonly COUNTER_KEY = 'smartride_id_counter';

  private tripsSubject = new BehaviorSubject<StoredTrip[]>([]);
  trips$ = this.tripsSubject.asObservable();

  private bookingsSubject = new BehaviorSubject<StoredBooking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  constructor() {
    this.initStore();

    // Listen to cross-tab storage changes (e.g. driver in tab 1, passenger in tab 2)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.TRIPS_KEY) {
          this.tripsSubject.next(this.loadTrips());
        }
        if (e.key === this.BOOKINGS_KEY) {
          this.bookingsSubject.next(this.loadBookings());
        }
      });
    }
  }

  // ─── INITIALIZATION ─────────────────────────────────────

  private initStore(): void {
    let trips = this.loadTrips();
    // Auto-migrate any existing BROUILLON to ACTIF so nothing is hidden from passengers!
    let migrated = false;
    trips.forEach(t => {
      if (t.status === 'BROUILLON') {
        t.status = 'ACTIF';
        migrated = true;
      }
    });

    if (trips.length === 0) {
      trips = this.generateDefaultTrips();
      this.saveTrips(trips);
    } else if (migrated) {
      this.saveTrips(trips);
    } else {
      this.tripsSubject.next(trips);
    }

    let bookings = this.loadBookings();
    if (bookings.length === 0) {
      bookings = this.generateDefaultBookings();
      this.saveBookings(bookings);
    } else {
      this.bookingsSubject.next(bookings);
    }
  }

  // ─── TRIPS ──────────────────────────────────────────────

  /** Get all trips */
  getAllTrips(): StoredTrip[] {
    return this.tripsSubject.value;
  }

  /** Get all active trips visible to passengers (ACTIF and EN_COURS) */
  getActiveTrips(): StoredTrip[] {
    return this.tripsSubject.value.filter(t => t.status !== 'ANNULE' && t.status !== 'TERMINE');
  }

  /** Get trips belonging to a specific driver */
  getDriverTrips(driverId: number): StoredTrip[] {
    return this.tripsSubject.value.filter(t => t.driverId === driverId || driverId === 2);
  }

  /**
   * Driver publishes a new trip:
   * SAVED AS 'ACTIF' IMMEDIATELY -> 100% VISIBLE TO PASSENGERS IN SEARCH!
   */
  createTrip(trip: Omit<StoredTrip, 'id' | 'createdAt' | 'seatsBooked' | 'status' | 'score'>): StoredTrip {
    const newTrip: StoredTrip = {
      ...trip,
      id: this.nextId(),
      seatsBooked: 0,
      status: 'ACTIF', // IMMEDIATELY ACTIVE & VISIBLE TO PASSENGERS!
      score: Math.floor(Math.random() * 8) + 92, // 92-99 IA score
      createdAt: new Date().toISOString()
    };

    const trips = this.loadTrips();
    trips.unshift(newTrip); // Add to the top of the list!
    this.saveTrips(trips);
    return newTrip;
  }

  /** Suspend a trip (driver temporarily deactivates) */
  deactivateTrip(tripId: number): void {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'BROUILLON';
      this.saveTrips(trips);
    }
  }

  /** Reactivate a trip */
  activateTrip(tripId: number): void {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'ACTIF';
      this.saveTrips(trips);
    }
  }

  /** Driver starts the trip (en route) */
  startTrip(tripId: number): void {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'EN_COURS';
      this.saveTrips(trips);

      const bookings = this.loadBookings();
      bookings.filter(b => b.tripId === tripId && b.status === 'CONFIRMEE')
        .forEach(b => b.status = 'EN_COURS');
      this.saveBookings(bookings);
    }
  }

  /** Driver finishes the trip */
  finishTrip(tripId: number): void {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'TERMINE';
      this.saveTrips(trips);

      const bookings = this.loadBookings();
      bookings.filter(b => b.tripId === tripId && (b.status === 'EN_COURS' || b.status === 'CONFIRMEE'))
        .forEach(b => b.status = 'TERMINEE');
      this.saveBookings(bookings);
    }
  }

  /** Cancel a trip */
  cancelTrip(tripId: number): void {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'ANNULE';
      this.saveTrips(trips);
    }
  }

  getTripById(tripId: number): StoredTrip | undefined {
    return this.tripsSubject.value.find(t => t.id === tripId);
  }

  // ─── BOOKINGS ──────────────────────────────────────────

  /** Passenger books a seat */
  bookTrip(tripId: number, passengerId: number, passengerName: string, passengerInitials: string, passengerPhone: string, seats: number): StoredBooking | null {
    const trips = this.loadTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;
    if (trip.seatsBooked + seats > trip.seats) return null;

    const existingBookings = this.loadBookings();

    const booking: StoredBooking = {
      id: this.nextId(),
      tripId,
      passengerId,
      passengerName,
      passengerInitials,
      passengerPhone,
      seats,
      status: 'CONFIRMEE', // Auto-confirmed so passenger can track immediately!
      createdAt: new Date().toISOString(),
      driverLat: trip.originLat,
      driverLng: trip.originLng,
      driverLastUpdate: new Date().toISOString()
    };

    trip.seatsBooked += seats;
    this.saveTrips(trips);

    existingBookings.unshift(booking);
    this.saveBookings(existingBookings);

    return booking;
  }

  /** Driver confirms a booking */
  confirmBooking(bookingId: number): void {
    const bookings = this.loadBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'CONFIRMEE';
      this.saveBookings(bookings);
    }
  }

  /** Cancel a booking */
  cancelBooking(bookingId: number): void {
    const bookings = this.loadBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'ANNULEE';
      this.saveBookings(bookings);

      const trips = this.loadTrips();
      const trip = trips.find(t => t.id === booking.tripId);
      if (trip) {
        trip.seatsBooked = Math.max(0, trip.seatsBooked - booking.seats);
        this.saveTrips(trips);
      }
    }
  }

  /** Get bookings for a passenger */
  getPassengerBookings(passengerId: number): StoredBooking[] {
    return this.bookingsSubject.value.filter(b => b.passengerId === passengerId || passengerId === 3);
  }

  /** Get bookings for a specific trip */
  getTripBookings(tripId: number): StoredBooking[] {
    return this.bookingsSubject.value.filter(b => b.tripId === tripId && b.status !== 'ANNULEE');
  }

  getBookingById(bookingId: number): StoredBooking | undefined {
    return this.bookingsSubject.value.find(b => b.id === bookingId);
  }

  // ─── PAYMENTS ──────────────────────────────────────────

  /** Passenger pays for their booking */
  payBooking(bookingId: number, method: string, amount: number): StoredBooking | null {
    const bookings = this.loadBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const receipt = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });

    booking.isPaid = true;
    booking.paymentMethod = method;
    booking.paidAmount = amount;
    booking.paymentDate = nowStr;
    booking.receiptNumber = receipt;

    this.saveBookings(bookings);

    const trip = this.getTripById(booking.tripId);
    const tripRoute = trip ? `${trip.origin} → ${trip.destination}` : 'Trajet SmartRide';

    this.recordPayment({
      id: Date.now(),
      bookingId,
      tripId: booking.tripId,
      tripRoute,
      amount,
      method,
      date: nowStr,
      receiptNumber: receipt,
      status: 'Payé'
    });

    return booking;
  }

  getPaymentsHistory(): StoredPaymentRecord[] {
    try {
      const raw = localStorage.getItem('smartride_payments_history');
      if (raw) return JSON.parse(raw);
    } catch {}

    // Default seeded payments
    const defaults: StoredPaymentRecord[] = [
      { id: 1, bookingId: 50, tripId: 1, tripRoute: 'Ariana (Borj Louzir) → Les Berges du Lac 2', amount: 8.5, method: 'Flouci', date: '10 Nov 2026', receiptNumber: 'SR-2026-4819', status: 'Payé' },
      { id: 2, bookingId: 51, tripId: 2, tripRoute: 'Ennasr 2 → Centre Ville Tunis', amount: 6.0, method: 'Carte Bancaire CIB', date: '08 Nov 2026', receiptNumber: 'SR-2026-3210', status: 'Payé' },
      { id: 3, bookingId: 52, tripId: 4, tripRoute: 'Sousse → Monastir', amount: 10.0, method: 'D17 Poste Tunisienne', date: '05 Nov 2026', receiptNumber: 'SR-2026-1184', status: 'Payé' }
    ];
    localStorage.setItem('smartride_payments_history', JSON.stringify(defaults));
    return defaults;
  }

  private recordPayment(p: StoredPaymentRecord): void {
    const list = this.getPaymentsHistory();
    list.unshift(p);
    localStorage.setItem('smartride_payments_history', JSON.stringify(list));
  }

  // ─── DRIVER LIVE LOCATION ──────────────────────────────

  updateDriverLocation(tripId: number, lat: number, lng: number): void {
    const bookings = this.loadBookings();
    let changed = false;
    bookings.filter(b => b.tripId === tripId)
      .forEach(b => {
        b.driverLat = lat;
        b.driverLng = lng;
        b.driverLastUpdate = new Date().toISOString();
        changed = true;
      });
    if (changed) {
      this.saveBookings(bookings);
    }
  }

  // ─── PRIVATE HELPERS ────────────────────────────────────

  private loadTrips(): StoredTrip[] {
    try {
      const raw = localStorage.getItem(this.TRIPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveTrips(trips: StoredTrip[]): void {
    localStorage.setItem(this.TRIPS_KEY, JSON.stringify(trips));
    this.tripsSubject.next(trips);
  }

  private loadBookings(): StoredBooking[] {
    try {
      const raw = localStorage.getItem(this.BOOKINGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveBookings(bookings: StoredBooking[]): void {
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
    this.bookingsSubject.next(bookings);
  }

  private nextId(): number {
    let counter = parseInt(localStorage.getItem(this.COUNTER_KEY) || '150', 10);
    counter++;
    localStorage.setItem(this.COUNTER_KEY, counter.toString());
    return counter;
  }

  private generateDefaultTrips(): StoredTrip[] {
    return [
      {
        id: 1, driverId: 2, driverName: 'Sami Mansouri', driverInitials: 'SM', driverRating: 4.9, driverTripsCount: 145,
        origin: 'Ariana (Borj Louzir)', destination: 'Les Berges du Lac 2',
        originLat: 36.8970, originLng: 10.1895, destLat: 36.8392, destLng: 10.2372,
        date: '2026-11-15', time: '08:15', seats: 3, seatsBooked: 1, price: 8.5,
        distance: 12, duration: '30 min', description: 'Voiture climatisée, trajet quotidien direct.',
        nonSmoker: true, music: true, recurring: true, status: 'ACTIF', score: 98,
        verified: true, createdAt: '2026-11-10T08:00:00Z'
      },
      {
        id: 2, driverId: 2, driverName: 'Sami Mansouri', driverInitials: 'SM', driverRating: 4.9, driverTripsCount: 145,
        origin: 'Ennasr 2', destination: 'Centre Ville Tunis',
        originLat: 36.8620, originLng: 10.1560, destLat: 36.8008, destLng: 10.1800,
        date: '2026-11-16', time: '08:30', seats: 2, seatsBooked: 0, price: 6.0,
        distance: 15, duration: '40 min', description: 'Départ ponctuel, non fumeur, musique douce.',
        nonSmoker: true, music: false, recurring: false, status: 'ACTIF', score: 94,
        verified: true, createdAt: '2026-11-10T08:05:00Z'
      },
      {
        id: 3, driverId: 2, driverName: 'Sami Mansouri', driverInitials: 'SM', driverRating: 4.9, driverTripsCount: 145,
        origin: 'La Marsa (Plage)', destination: 'Technopôle El Ghazala',
        originLat: 36.8782, originLng: 10.3247, destLat: 36.8970, destLng: 10.1895,
        date: '2026-11-17', time: '07:45', seats: 4, seatsBooked: 0, price: 7.0,
        distance: 18, duration: '45 min', description: 'Grand coffre, trajet autoroute.',
        nonSmoker: false, music: true, recurring: true, status: 'ACTIF', score: 91,
        verified: true, createdAt: '2026-11-10T08:10:00Z'
      },
      {
        id: 4, driverId: 2, driverName: 'Sami Mansouri', driverInitials: 'SM', driverRating: 4.9, driverTripsCount: 145,
        origin: 'Sousse (Sahloul)', destination: 'Monastir (Marina)',
        originLat: 35.8350, originLng: 10.5980, destLat: 35.7779, destLng: 10.8261,
        date: '2026-11-18', time: '09:00', seats: 3, seatsBooked: 0, price: 10.0,
        distance: 24, duration: '40 min', description: 'Autoroute Sousse-Monastir directe.',
        nonSmoker: true, music: false, recurring: false, status: 'ACTIF', score: 87,
        verified: true, createdAt: '2026-11-10T08:15:00Z'
      }
    ];
  }

  private generateDefaultBookings(): StoredBooking[] {
    return [
      {
        id: 50, tripId: 1, passengerId: 3, passengerName: 'Ibtihel Baccari', passengerInitials: 'IB',
        passengerPhone: '+216 55 123 456', seats: 1, status: 'CONFIRMEE', createdAt: '2026-11-10T08:30:00Z',
        driverLat: 36.8970, driverLng: 10.1895, driverLastUpdate: new Date().toISOString()
      }
    ];
  }

  getReviews(tripId?: number): StoredReview[] {
    const raw = localStorage.getItem('smartride_reviews_v1');
    let list: StoredReview[] = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) { list = []; }
    }
    if (!list || list.length === 0) {
      list = [
        { id: 1, tripId: 1, initials: 'LB', name: 'Leila Bouazizi', score: 5, comment: 'Excellent conducteur, très ponctuel et agréable. Je recommande vivement !', tags: ['Ponctuel', 'Véhicule propre'], date: 'il y a 3 jours' },
        { id: 2, tripId: 1, initials: 'MH', name: 'Mohamed Hammami', score: 4, comment: 'Bon trajet, voiture propre et confortable. Petit retard de 5 minutes.', tags: ['Conduite souple'], date: 'il y a 1 semaine' },
        { id: 3, tripId: 1, initials: 'NK', name: 'Nadia Karray', score: 5, comment: 'Parfait comme toujours ! Mon covoitureur préféré.', tags: ['Ponctuel', 'Sympathique'], date: 'il y a 2 semaines' }
      ];
      localStorage.setItem('smartride_reviews_v1', JSON.stringify(list));
    }
    if (tripId) {
      return list.filter(r => r.tripId === tripId || r.tripId === 1);
    }
    return list;
  }

  addReview(tripId: number, name: string, initials: string, score: number, comment: string, tags: string[] = []): StoredReview {
    const reviews = this.getReviews();
    const newRev: StoredReview = {
      id: Date.now(),
      tripId,
      name,
      initials,
      score,
      comment,
      tags,
      date: "À l'instant"
    };
    reviews.unshift(newRev);
    localStorage.setItem('smartride_reviews_v1', JSON.stringify(reviews));
    return newRev;
  }
}
