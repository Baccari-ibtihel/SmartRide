import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface KeycloakNewUser {
  name: string;
  email: string;
  role: 'PASSAGER' | 'CONDUCTEUR' | 'ADMIN';
  password?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakAdminService {
  private keycloakUrl = 'http://localhost:8180';
  private realm = 'smartride-realm';

  // Role IDs from Keycloak smartride-realm
  private roleMap: Record<string, { id: string; name: string }> = {
    'ADMIN': { id: '9d3f96ea-a18a-407b-b8cc-6c01afecd4c8', name: 'ADMIN' },
    'CONDUCTEUR': { id: 'f643c5e1-5370-4fd6-99a1-06554ccdd3f6', name: 'CONDUCTEUR' },
    'PASSAGER': { id: 'c9892769-2733-405b-83ec-c59fcc817f6d', name: 'PASSAGER' }
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtain Admin Access Token from master realm
   */
  private getAdminToken(): Observable<string> {
    const body = new HttpParams()
      .set('client_id', 'admin-cli')
      .set('username', 'admin')
      .set('password', 'admin')
      .set('grant_type', 'password');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${this.keycloakUrl}/realms/master/protocol/openid-connect/token`, body.toString(), { headers }).pipe(
      map(res => res.access_token)
    );
  }

  /**
   * Create user directly inside Keycloak smartride-realm and map the role
   */
  createUser(userData: KeycloakNewUser): Observable<any> {
    const parts = userData.name.trim().split(' ');
    const firstName = parts[0] || userData.name;
    const lastName = parts.slice(1).join(' ') || 'SmartRide';
    const cleanUsername = userData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const password = userData.password || 'smartride123';

    return this.getAdminToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        const keycloakUserPayload = {
          username: cleanUsername,
          email: userData.email.trim(),
          firstName: firstName,
          lastName: lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false
            }
          ]
        };

        // 1. Create the user
        return this.http.post(`${this.keycloakUrl}/admin/realms/${this.realm}/users`, keycloakUserPayload, { headers, observe: 'response' }).pipe(
          switchMap(() => {
            // 2. Fetch the created user ID
            return this.http.get<any[]>(`${this.keycloakUrl}/admin/realms/${this.realm}/users?username=${cleanUsername}`, { headers }).pipe(
              switchMap(users => {
                if (!users || users.length === 0) return of(null);
                const userId = users[0].id;
                const roleObj = this.roleMap[userData.role] || this.roleMap['PASSAGER'];

                // 3. Map realm role to user
                return this.http.post(
                  `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
                  [roleObj],
                  { headers }
                );
              })
            );
          })
        );
      }),
      catchError(err => {
        console.warn('Keycloak user creation warning/fallback:', err);
        return of({ success: false, error: err });
      })
    );
  }
}
