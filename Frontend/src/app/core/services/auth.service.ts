import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getSavedUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly USERS_STORAGE_KEY = 'smartride_registered_users';

  constructor(private http: HttpClient) {
    this.initDefaultUsers();
  }

  /**
   * Register a new user with chosen role (CONDUCTEUR, PASSAGER, ADMIN, BOTH)
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    const existingUsers = this.getRegisteredUsers();
    
    // Check if email already taken
    if (existingUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return throwError(() => new Error('Un compte existe déjà avec cette adresse email !'));
    }

    const newUser: User = {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '+216 00 000 000',
      role: (data.role === 'ADMIN' ? 'ADMIN' : data.role === 'CONDUCTEUR' ? 'CONDUCTEUR' : 'PASSAGER'),
      city: data.city || 'Tunis',
      avatar: (data.firstName[0] + data.lastName[0]).toUpperCase(),
      isActive: true,
      isVerified: true,
      rating: 5.0,
      tripsCount: 0,
      createdAt: new Date().toISOString()
    };

    // Save with password for local auth
    const storedUser = { ...newUser, password: data.password };
    existingUsers.push(storedUser);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(existingUsers));

    // Generate simulated JWT
    const token = this.generateToken(newUser);
    const authRes: AuthResponse = { token, user: newUser };

    // Set as active logged-in user
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);

    return of(authRes);
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const existingUsers = this.getRegisteredUsers();
    const found = existingUsers.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
    );

    if (found) {
      const { password, ...userObj } = found;
      const token = this.generateToken(userObj as User);
      const authRes: AuthResponse = { token, user: userObj as User };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      this.currentUserSubject.next(userObj as User);

      return of(authRes);
    }

    return throwError(() => new Error('Email ou mot de passe incorrect !'));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Switch active user role (CONDUCTEUR, PASSAGER, ADMIN) dynamically
   */
  switchRole(role: 'CONDUCTEUR' | 'PASSAGER' | 'ADMIN'): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      role
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.updateUserInStore(updatedUser);
    this.currentUserSubject.next(updatedUser);
    return updatedUser;
  }

  /**
   * Update profile fields (phone, city, bio, names)
   */
  updateProfile(data: Partial<User>): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...data,
      avatar: data.firstName && data.lastName ? (data.firstName[0] + data.lastName[0]).toUpperCase() : user.avatar
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.updateUserInStore(updatedUser);
    this.currentUserSubject.next(updatedUser);
    return updatedUser;
  }

  /**
   * Quick switch account for demonstration and testing
   */
  quickSwitchAccount(type: 'driver' | 'passenger' | 'admin'): User {
    const email = type === 'driver' ? 'driver@smartride.tn' : type === 'passenger' ? 'passenger@smartride.tn' : 'admin@smartride.tn';
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    const userObj: User = found ? {
      id: found.id,
      firstName: found.firstName,
      lastName: found.lastName,
      email: found.email,
      phone: found.phone,
      role: found.role,
      city: found.city,
      avatar: found.avatar,
      isActive: found.isActive,
      rating: found.rating,
      tripsCount: found.tripsCount,
      createdAt: found.createdAt
    } : {
      id: Date.now(),
      firstName: type === 'driver' ? 'Sami' : type === 'passenger' ? 'Ibtihel' : 'Admin',
      lastName: type === 'driver' ? 'Mansouri' : type === 'passenger' ? 'Baccari' : 'SmartRide',
      email,
      phone: '+216 98 450 120',
      role: type === 'driver' ? 'CONDUCTEUR' : type === 'passenger' ? 'PASSAGER' : 'ADMIN',
      city: 'Tunis',
      avatar: type === 'driver' ? 'SM' : type === 'passenger' ? 'IB' : 'AD',
      isActive: true,
      rating: 4.9,
      tripsCount: 12,
      createdAt: new Date().toISOString()
    };

    const token = this.generateToken(userObj);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    this.currentUserSubject.next(userObj);
    return userObj;
  }

  private updateUserInStore(updated: User): void {
    const users = this.getRegisteredUsers();
    const idx = users.findIndex(u => u.id === updated.id || u.email.toLowerCase() === updated.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  private getSavedUser(): User | null {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  }

  private getRegisteredUsers(): any[] {
    const raw = localStorage.getItem(this.USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private initDefaultUsers(): void {
    const users = this.getRegisteredUsers();
    if (users.length === 0) {
      const defaults = [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'SmartRide',
          email: 'admin@smartride.tn',
          password: 'admin123',
          phone: '+216 70 000 000',
          role: 'ADMIN',
          city: 'Tunis',
          avatar: 'AD',
          isActive: true,
          rating: 5.0,
          tripsCount: 35,
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          firstName: 'Sami',
          lastName: 'Mansouri',
          email: 'driver@smartride.tn',
          password: 'driver123',
          phone: '+216 98 450 120',
          role: 'CONDUCTEUR',
          city: 'Ariana',
          avatar: 'SM',
          isActive: true,
          rating: 4.9,
          tripsCount: 145,
          createdAt: '2024-02-15'
        },
        {
          id: 3,
          firstName: 'Ibtihel',
          lastName: 'Baccari',
          email: 'passenger@smartride.tn',
          password: 'pass123',
          phone: '+216 55 123 456',
          role: 'PASSAGER',
          city: 'Ariana',
          avatar: 'IB',
          isActive: true,
          rating: 5.0,
          tripsCount: 23,
          createdAt: '2024-03-10'
        }
      ];
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(defaults));
    }
  }

  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      realm_access: { roles: [user.role] },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400
    }));
    return `${header}.${payload}.simulated_signature`;
  }
}
