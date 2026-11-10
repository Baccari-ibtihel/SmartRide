import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { DashboardStats, RevenueData, ActivityLog } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUserStatus(id: number, status: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getRevenueStats(): Observable<RevenueData[]> {
    return this.http.get<RevenueData[]>(`${this.apiUrl}/dashboard/revenue`);
  }

  getActivityLog(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/dashboard/activity`);
  }

  getMatchingStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/matching`);
  }
}
