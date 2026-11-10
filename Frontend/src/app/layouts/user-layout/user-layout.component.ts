import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Top Navbar -->
    <header class="top-nav">
      <div class="nav-container">
        <a routerLink="/user/home" class="logo">
          <span class="logo-icon">🚗</span>
          <span class="logo-text">Smart<strong>Ride</strong></span>
        </a>

        <button class="hamburger" (click)="menuOpen = !menuOpen" [class.active]="menuOpen">
          <span></span><span></span><span></span>
        </button>

        <nav class="nav-links" [class.open]="menuOpen">
          <a routerLink="/user/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen=false">Accueil</a>

          <!-- SPECIFIC TO CONDUCTEUR ONLY: -->
          <a routerLink="/user/publish-trip" routerLinkActive="active" (click)="menuOpen=false" *ngIf="currentUser && currentUser.role === 'CONDUCTEUR'" class="nav-conducteur-btn">
            🚗 Publier un trajet
          </a>
          <a routerLink="/user/my-trips" routerLinkActive="active" (click)="menuOpen=false" *ngIf="currentUser && currentUser.role === 'CONDUCTEUR'">
            📋 Mes Trajets
          </a>

          <!-- SPECIFIC TO PASSAGER ONLY (or visitor): -->
          <a routerLink="/user/search" routerLinkActive="active" (click)="menuOpen=false" *ngIf="!currentUser || currentUser.role === 'PASSAGER'">
            🔍 Rechercher
          </a>
          <a routerLink="/user/bookings" routerLinkActive="active" (click)="menuOpen=false" *ngIf="currentUser && currentUser.role === 'PASSAGER'">
            📋 Mes Réservations
          </a>
          <a routerLink="/user/payments" routerLinkActive="active" (click)="menuOpen=false" *ngIf="currentUser && currentUser.role === 'PASSAGER'">
            💳 Mes Paiements
          </a>
          <a routerLink="/user/tracking/0" routerLinkActive="active" (click)="menuOpen=false" *ngIf="currentUser && currentUser.role === 'PASSAGER'" class="track-nav-link">
            📍 Suivi GPS
          </a>

          <!-- SPECIFIC TO ADMIN ONLY: -->
          <a routerLink="/admin/dashboard" class="admin-link-badge" *ngIf="currentUser && currentUser.role === 'ADMIN'" (click)="menuOpen=false">
            ⚡ Back-Office Admin
          </a>
        </nav>

        <div class="nav-right">
          <!-- When Logged In -->
          <ng-container *ngIf="currentUser; else authButtons">
            <a routerLink="/user/notifications" class="notif-btn" title="Notifications">
              🔔 <span class="notif-badge">3</span>
            </a>

            <div class="profile-dropdown" (click)="dropdownOpen = !dropdownOpen">
              <div class="avatar" [ngClass]="'role-' + currentUser.role.toLowerCase()">
                {{ currentUser.avatar || 'U' }}
              </div>
              <div class="user-meta hide-mobile">
                <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
                <span class="role-pill" [ngClass]="currentUser.role.toLowerCase()">
                  {{ currentUser.role }}
                </span>
              </div>
              <span class="chevron">▾</span>

              <div class="dropdown-menu" *ngIf="dropdownOpen">
                <div class="dropdown-header">
                  <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>
                  <span class="text-muted">{{ currentUser.email }}</span>
                </div>
                <hr>

                <!-- Role Quick Switch in Menu -->
                <div class="dropdown-role-switch">
                  <span class="d-label">Changer de rôle :</span>
                  <div class="d-btns">
                    <button class="d-btn" [class.active]="currentUser.role==='CONDUCTEUR'" (click)="switchRole('CONDUCTEUR')">🚗 Conducteur</button>
                    <button class="d-btn" [class.active]="currentUser.role==='PASSAGER'" (click)="switchRole('PASSAGER')">🧑‍💼 Passager</button>
                  </div>
                </div>
                <hr>

                <a routerLink="/user/profile" (click)="dropdownOpen=false">👤 Mon Profil & Rôle</a>
                <a routerLink="/user/publish-trip" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'CONDUCTEUR'">🚗 Proposer un trajet</a>
                <a routerLink="/user/my-trips" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'CONDUCTEUR'">📋 Mes Trajets publiés</a>
                <a routerLink="/user/search" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'PASSAGER'">🔍 Rechercher un trajet</a>
                <a routerLink="/user/bookings" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'PASSAGER'">📋 Mes Réservations</a>
                <a routerLink="/user/payments" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'PASSAGER'">💳 Mes Paiements & Factures</a>
                <a routerLink="/user/tracking/0" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'PASSAGER'">📍 Suivi GPS en direct</a>
                <a routerLink="/admin/dashboard" (click)="dropdownOpen=false" *ngIf="currentUser.role === 'ADMIN'" class="text-accent fw-700">
                  ⚙️ Espace Administration
                </a>
                <hr>
                <a href="#" (click)="onLogout($event)">🚪 Déconnexion</a>
              </div>
            </div>
          </ng-container>

          <!-- When NOT Logged In -->
          <ng-template #authButtons>
            <div class="auth-cta-group">
              <a routerLink="/auth/login" class="btn btn-sm btn-outline">Connexion</a>
              <a routerLink="/auth/register" class="btn btn-sm btn-primary">Créer un compte</a>
            </div>
          </ng-template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>🚗 SmartRide</h4>
            <p>Plateforme de covoiturage intelligente propulsée par l'IA pour des trajets optimisés en Tunisie.</p>
          </div>
          <div class="footer-col">
            <h4>Navigation</h4>
            <a routerLink="/user/home">Accueil</a>
            <a routerLink="/user/search">Rechercher</a>
            <a routerLink="/user/publish-trip">Publier un trajet</a>
          </div>
          <div class="footer-col">
            <h4>Rôles & Accès</h4>
            <a routerLink="/auth/register">Devenir Conducteur</a>
            <a routerLink="/auth/register">Voyager comme Passager</a>
            <a routerLink="/admin/dashboard">Portail Administrateur</a>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <p>📧 contact&#64;smartride.tn</p>
            <p>📞 +216 70 000 000</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 SmartRide Tunisie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }

    .top-nav {
      background: var(--white); box-shadow: var(--shadow-sm);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-container {
      max-width: 1280px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; height: 64px; gap: 24px;
    }
    .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--primary); }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { font-size: 1.3rem; color: var(--primary); }
    .logo-text strong { color: var(--accent); }

    .nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; align-items: center; }
    .nav-links a {
      padding: 8px 14px; border-radius: var(--radius-sm); font-size: 0.9rem;
      font-weight: 500; color: var(--gray-600); transition: var(--transition); text-decoration: none;
    }
    .nav-links a:hover { background: var(--gray-50); color: var(--accent); }
    .nav-links a.active { background: rgba(14,133,163,0.1); color: var(--accent); font-weight: 600; }

    .admin-link-badge {
      background: rgba(220,53,69,0.1) !important; color: var(--danger) !important;
      font-weight: 700 !important;
    }
    .track-nav-link {
      background: rgba(40,167,69,0.1) !important; color: #28a745 !important;
      font-weight: 700 !important;
    }
    .nav-conducteur-btn {
      background: rgba(2,132,199,0.1) !important; color: #0284c7 !important;
      font-weight: 700 !important;
    }

    .dropdown-role-switch { padding: 8px 14px; display: flex; flex-direction: column; gap: 6px; background: var(--gray-50); border-radius: var(--radius-sm); margin: 4px 8px; }
    .d-label { font-size: 0.72rem; color: var(--gray-500); font-weight: 700; text-transform: uppercase; }
    .d-btns { display: flex; gap: 4px; }
    .d-btn {
      flex: 1; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--gray-300);
      font-size: 0.72rem; font-weight: 600; cursor: pointer; background: white; transition: var(--transition);
    }
    .d-btn.active { background: var(--accent); color: white; border-color: var(--accent); }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .auth-cta-group { display: flex; gap: 8px; }

    .notif-btn {
      position: relative; font-size: 1.2rem; cursor: pointer;
      padding: 6px; border-radius: 50%; transition: var(--transition); text-decoration: none;
    }
    .notif-btn:hover { background: var(--gray-100); }
    .notif-badge {
      position: absolute; top: -2px; right: -4px; background: var(--danger);
      color: white; font-size: 0.65rem; padding: 2px 5px; border-radius: 10px; font-weight: 700;
    }

    .profile-dropdown {
      position: relative; display: flex; align-items: center; gap: 8px; cursor: pointer;
      padding: 4px 8px; border-radius: var(--radius-sm); transition: var(--transition);
    }
    .profile-dropdown:hover { background: var(--gray-50); }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem;
    }
    .avatar.admin-avatar { background: #8b5cf6; }

    .user-meta { display: flex; flex-direction: column; }
    .user-name { font-size: 0.85rem; font-weight: 700; color: var(--gray-800); line-height: 1.2; }
    .role-pill { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .role-pill.conducteur { color: #0284c7; }
    .role-pill.passager { color: #16a34a; }
    .role-pill.admin { color: #dc2626; font-weight: 800; }
    .chevron { font-size: 0.7rem; color: var(--gray-400); }

    .dropdown-menu {
      position: absolute; top: calc(100% + 8px); right: 0; background: var(--white);
      border-radius: var(--radius); box-shadow: var(--shadow-lg); min-width: 230px;
      padding: 8px 0; z-index: 200; animation: fadeIn 0.2s ease;
    }
    .dropdown-header { padding: 10px 16px; display: flex; flex-direction: column; }
    .dropdown-header strong { font-size: 0.9rem; color: var(--gray-800); }
    .dropdown-header .text-muted { font-size: 0.75rem; }
    .dropdown-menu a {
      display: block; padding: 9px 16px; font-size: 0.85rem; color: var(--gray-700);
      transition: var(--transition); text-decoration: none;
    }
    .dropdown-menu a:hover { background: var(--gray-50); color: var(--accent); }
    .dropdown-menu hr { border: none; border-top: 1px solid var(--gray-100); margin: 4px 0; }

    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--gray-700); transition: var(--transition); }

    .main-content { flex: 1; }

    .site-footer { background: var(--primary); color: rgba(255,255,255,0.8); margin-top: 60px; }
    .footer-container { max-width: 1280px; margin: 0 auto; padding: 48px 24px 24px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 32px; }
    .footer-col h4 { color: white; margin-bottom: 16px; font-size: 1rem; }
    .footer-col p { font-size: 0.85rem; line-height: 1.8; }
    .footer-col a { display: block; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; text-decoration: none; transition: var(--transition); }
    .footer-col a:hover { color: var(--accent-light); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px; text-align: center; font-size: 0.8rem; }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none; position: absolute; top: 64px; left: 0; right: 0;
        background: var(--white); flex-direction: column; padding: 16px;
        box-shadow: var(--shadow); z-index: 99;
      }
      .nav-links.open { display: flex; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
      .hide-mobile { display: none; }
    }
  `]
})
export class UserLayoutComponent implements OnInit {
  menuOpen = false;
  dropdownOpen = false;
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  switchRole(role: 'CONDUCTEUR' | 'PASSAGER' | 'ADMIN'): void {
    this.dropdownOpen = false;
    this.authService.switchRole(role);
    if (role === 'CONDUCTEUR') {
      this.router.navigate(['/user/publish-trip']);
    } else if (role === 'PASSAGER') {
      this.router.navigate(['/user/search']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.dropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
