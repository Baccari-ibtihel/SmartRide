import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(tripId: number, seats: number): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, { tripId, seats });
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  cancelBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }

  confirmBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
