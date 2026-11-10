import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/rating.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  rateTrip(tripId: number, score: number, comment: string): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, { tripId, score, comment });
  }

  getTripRatings(tripId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getMyRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/my-ratings`);
  }

  getAllRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(this.apiUrl);
  }
}
