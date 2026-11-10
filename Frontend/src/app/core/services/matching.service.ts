import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  private apiUrl = `${environment.apiUrl}/matching`;

  constructor(private http: HttpClient) {}

  getMatches(origin: string, destination: string, date: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/find`, { origin, destination, date });
  }

  getMatchScore(tripId: number): Observable<{ score: number }> {
    return this.http.get<{ score: number }>(`${this.apiUrl}/score/${tripId}`);
  }
}
