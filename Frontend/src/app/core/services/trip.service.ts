import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripService {
  private apiUrl = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  getTrips(filters?: any): Observable<Trip[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    }
    return this.http.get<Trip[]>(this.apiUrl, { params });
  }

  getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`);
  }

  createTrip(trip: Partial<Trip>): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip);
  }

  updateTrip(id: number, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${id}`, trip);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchTrips(origin: string, destination: string, date: string): Observable<Trip[]> {
    const params = new HttpParams().set('origin', origin).set('destination', destination).set('date', date);
    return this.http.get<Trip[]>(`${this.apiUrl}/search`, { params });
  }

  getMyTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/my-trips`);
  }
}
