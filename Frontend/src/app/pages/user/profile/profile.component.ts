import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { TripStoreService } from '../../../core/services/trip-store.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page animate-fade" *ngIf="user">
      <!-- Profile Header Card -->
      <div class="profile-header card">
        <div class="profile-top">
          <div class="avatar avatar-lg" [ngClass]="getRoleAvatarClass()">
            {{ user.avatar || 'U' }}
          </div>
          <div class="profile-info">
            <div class="name-row">
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <span class="role-badge-large" [ngClass]="user.role.toLowerCase()">
                {{ getRoleDisplayLabel(user.role) }}
              </span>
            </div>
            <p class="text-muted">{{ user.email }}</p>
            <div class="profile-badges">
              <span class="badge badge-success">✅ Compte Vérifié</span>
              <span class="badge badge-primary">⭐ {{ user.rating }} / 5.0</span>
              <span class="badge badge-info">📍 {{ user.city || 'Tunis' }}</span>
            </div>
          </div>
        </div>

        <!-- Role-Specific Metrics -->
        <div class="profile-stats">
          <div class="pstat" *ngIf="user.role === 'CONDUCTEUR'">
            <strong>{{ myPublishedTripsCount }}</strong>
            <span>Trajets publiés</span>
          </div>
          <div class="pstat" *ngIf="user.role === 'PASSAGER'">
            <strong>{{ myBookingsCount }}</strong>
            <span>Réservations effectuées</span>
          </div>
          <div class="pstat">
            <strong>{{ user.rating }}</strong>
            <span>Note moyenne</span>
          </div>
          <div class="pstat">
            <strong>99%</strong>
            <span>Taux de réponse</span>
          </div>
          <div class="pstat">
            <strong>Membre actif</strong>
            <span>Depuis Mars 2024</span>
          </div>
        </div>
      </div>

      <!-- ROLE SWITCHER CARD - DYNAMIC ROLE MANAGEMENT -->
      <div class="card role-switcher-card mt-3">
        <div class="switcher-header">
          <div class="switcher-icon">🔄</div>
          <div>
            <h3>Gestion de votre Rôle sur SmartRide</h3>
            <p>Basculez facilement entre les modes pour tester ou changer votre utilisation de la plateforme :</p>
          </div>
        </div>

        <div class="roles-grid">
          <!-- CONDUCTEUR Option -->
          <div
            class="role-choice"
            [class.active]="user.role === 'CONDUCTEUR'"
            (click)="selectRole('CONDUCTEUR')"
          >
            <div class="choice-icon">🚗</div>
            <div class="choice-content">
              <strong>Mode Conducteur</strong>
              <p>Publiez vos annonces de trajets, fixez vos tarifs et gérez les demandes des passagers.</p>
              <span class="status-indicator" *ngIf="user.role === 'CONDUCTEUR'">✓ Actuellement Actif</span>
              <span class="switch-btn" *ngIf="user.role !== 'CONDUCTEUR'">Activer ce rôle</span>
            </div>
          </div>

          <!-- PASSAGER Option -->
          <div
            class="role-choice"
            [class.active]="user.role === 'PASSAGER'"
            (click)="selectRole('PASSAGER')"
          >
            <div class="choice-icon">🧑‍💼</div>
            <div class="choice-content">
              <strong>Mode Passager</strong>
              <p>Recherchez des covoitureurs par IA, réservez en ligne et suivez votre conducteur en direct.</p>
              <span class="status-indicator" *ngIf="user.role === 'PASSAGER'">✓ Actuellement Actif</span>
              <span class="switch-btn" *ngIf="user.role !== 'PASSAGER'">Activer ce rôle</span>
            </div>
          </div>

          <!-- ADMIN Option -->
          <div
            class="role-choice"
            [class.active]="user.role === 'ADMIN'"
            (click)="selectRole('ADMIN')"
          >
            <div class="choice-icon">⚙️</div>
            <div class="choice-content">
              <strong>Mode Administrateur</strong>
              <p>Supervisez l'ensemble des trajets, des comptes, du matching et des microservices.</p>
              <span class="status-indicator" *ngIf="user.role === 'ADMIN'">✓ Actuellement Actif</span>
              <span class="switch-btn" *ngIf="user.role !== 'ADMIN'">Activer ce rôle</span>
            </div>
          </div>
        </div>

        <div class="role-switch-feedback" *ngIf="roleSwitchedMessage">
          {{ roleSwitchedMessage }}
        </div>
      </div>

      <!-- Main Form Grid -->
      <div class="profile-grid mt-3">
        <!-- Personal Info Form -->
        <div class="card">
          <h3>Informations personnelles</h3>
          <form (ngSubmit)="saveProfile()">
            <div class="form-grid">
              <div class="form-group">
                <label>Prénom</label>
                <input class="form-control" [(ngModel)]="editData.firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input class="form-control" [(ngModel)]="editData.lastName" name="lastName" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-control" type="email" [(ngModel)]="editData.email" name="email" readonly>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input class="form-control" [(ngModel)]="editData.phone" name="phone">
              </div>
              <div class="form-group">
                <label>Ville de résidence</label>
                <select class="form-control" [(ngModel)]="editData.city" name="city">
                  <option value="Tunis">Tunis</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Ben Arous">Ben Arous</option>
                  <option value="Manouba">Manouba</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Nabeul">Nabeul</option>
                </select>
              </div>
              <div class="form-group">
                <label>Rôle actif</label>
                <input class="form-control bg-light" [value]="user.role" readonly>
              </div>
            </div>

            <!-- Role-Specific Fields -->
            <div class="driver-vehicle-section" *ngIf="user.role === 'CONDUCTEUR'">
              <h4 class="section-subtitle">🚗 Véhicule du conducteur</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Modèle du véhicule</label>
                  <input class="form-control" [(ngModel)]="vehicleData.model" name="vehicleModel" placeholder="Ex: Renault Clio 4">
                </div>
                <div class="form-group">
                  <label>Immatriculation (Plaque)</label>
                  <input class="form-control" [(ngModel)]="vehicleData.plate" name="vehiclePlate" placeholder="Ex: 214 TN 5421">
                </div>
              </div>
            </div>

            <div class="form-group mt-2">
              <label>Bio / Description</label>
              <textarea class="form-control" rows="3" [(ngModel)]="editData.bio" name="bio" placeholder="Parlez un peu de vos habitudes de déplacement..."></textarea>
            </div>

            <div class="form-actions mt-3">
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Enregistrement...' : '💾 Enregistrer les modifications' }}
              </button>
              <span class="save-success" *ngIf="saveSuccess">✓ Informations mises à jour avec succès !</span>
            </div>
          </form>
        </div>

        <!-- Role-Specific Action Hub -->
        <div class="card side-hub">
          <!-- CONDUCTEUR Hub -->
          <div *ngIf="user.role === 'CONDUCTEUR'" class="hub-block">
            <h3>🚗 Espace Conducteur</h3>
            <p class="hub-sub">Vos outils prioritaires en tant que conducteur :</p>
            <div class="hub-actions">
              <a routerLink="/user/publish-trip" class="btn btn-primary btn-block">➕ Publier un nouveau trajet</a>
              <a routerLink="/user/my-trips" class="btn btn-outline btn-block">📋 Gérer mes trajets publiés</a>
            </div>
            <div class="hub-tip mt-3">
              <span>💡</span>
              <p>Chaque trajet que vous publiez est immédiatement visible pour les passagers dans l'espace Recherche.</p>
            </div>
          </div>

          <!-- PASSAGER Hub -->
          <div *ngIf="user.role === 'PASSAGER'" class="hub-block">
            <h3>🧑‍💼 Espace Passager</h3>
            <p class="hub-sub">Vos fonctionnalités passager :</p>
            <div class="hub-actions">
              <a routerLink="/user/search" class="btn btn-primary btn-block">🔍 Rechercher un trajet</a>
              <a routerLink="/user/bookings" class="btn btn-outline btn-block">📋 Mes Réservations</a>
              <a routerLink="/user/tracking/0" class="btn btn-success btn-block">📍 Suivi GPS du conducteur</a>
            </div>
            <div class="hub-tip mt-3">
              <span>🛡️</span>
              <p>En tant que passager, vous pouvez voir la position exacte de votre conducteur en temps réel dès qu'il prend la route.</p>
            </div>
          </div>

          <!-- ADMIN Hub -->
          <div *ngIf="user.role === 'ADMIN'" class="hub-block">
            <h3>⚙️ Espace Administrateur</h3>
            <p class="hub-sub">Gestion globale de la plateforme :</p>
            <div class="hub-actions">
              <a routerLink="/admin/dashboard" class="btn btn-danger btn-block">⚡ Accéder au Back-Office Admin</a>
            </div>
          </div>

          <!-- Verifications list -->
          <h3 class="mt-4">Vérifications du profil</h3>
          <div class="verify-list">
            <div class="verify-item"><span class="v-icon done">✅</span><span>Email vérifié</span></div>
            <div class="verify-item"><span class="v-icon done">✅</span><span>Numéro de téléphone vérifié</span></div>
            <div class="verify-item">
              <span class="v-icon done">✅</span>
              <span>{{ user.role === 'CONDUCTEUR' ? 'Permis de conduire vérifié' : 'Identité certifiée' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 1080px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .mt-2 { margin-top: 12px; }
    .mt-3 { margin-top: 20px; }
    .mt-4 { margin-top: 28px; }

    .profile-header { padding: 28px; }
    .profile-top { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
    .avatar-lg {
      width: 76px; height: 76px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800;
      color: white; background: var(--accent);
    }
    .avatar-lg.role-conducteur { background: #0284c7; }
    .avatar-lg.role-passager { background: #16a34a; }
    .avatar-lg.role-admin { background: #8b5cf6; }

    .profile-info { flex: 1; }
    .name-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 4px; }
    .name-row h2 { margin: 0; color: var(--primary); font-size: 1.6rem; }
    .role-badge-large {
      font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
      padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;
    }
    .role-badge-large.conducteur { background: rgba(2,132,199,0.12); color: #0284c7; border: 1px solid rgba(2,132,199,0.3); }
    .role-badge-large.passager { background: rgba(22,163,74,0.12); color: #16a34a; border: 1px solid rgba(22,163,74,0.3); }
    .role-badge-large.admin { background: rgba(139,92,246,0.12); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); }

    .profile-badges { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .profile-stats { display: flex; justify-content: space-around; padding-top: 20px; border-top: 1px solid var(--gray-100); flex-wrap: wrap; gap: 12px; }
    .pstat { text-align: center; }
    .pstat strong { display: block; font-size: 1.2rem; color: var(--primary); font-weight: 800; }
    .pstat span { font-size: 0.78rem; color: var(--gray-500); }

    /* Role Switcher Card */
    .role-switcher-card { padding: 24px; border: 2px solid var(--accent-light); }
    .switcher-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .switcher-icon { font-size: 2rem; }
    .switcher-header h3 { margin: 0 0 4px; color: var(--primary); font-size: 1.2rem; }
    .switcher-header p { margin: 0; color: var(--gray-500); font-size: 0.85rem; }

    .roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .role-choice {
      padding: 18px; border: 2px solid var(--gray-200); border-radius: var(--radius);
      cursor: pointer; transition: var(--transition); display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 10px; background: var(--white);
    }
    .role-choice:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .role-choice.active {
      border-color: var(--accent); background: rgba(14,133,163,0.06);
      box-shadow: 0 0 0 2px rgba(14,133,163,0.2);
    }
    .choice-icon { font-size: 2.2rem; }
    .choice-content strong { display: block; font-size: 1rem; color: var(--primary); margin-bottom: 6px; }
    .choice-content p { font-size: 0.78rem; color: var(--gray-500); line-height: 1.4; margin: 0 0 12px; }
    .status-indicator {
      display: inline-block; font-size: 0.72rem; font-weight: 700; color: #16a34a;
      background: rgba(22,163,74,0.12); padding: 4px 10px; border-radius: 12px;
    }
    .switch-btn {
      display: inline-block; font-size: 0.72rem; font-weight: 700; color: var(--accent);
      background: var(--gray-100); padding: 4px 10px; border-radius: 12px;
      transition: var(--transition);
    }
    .role-choice:hover .switch-btn { background: var(--accent); color: white; }

    .role-switch-feedback {
      margin-top: 14px; padding: 12px; background: rgba(40,167,69,0.1);
      border-radius: var(--radius-sm); border-left: 3px solid #28a745;
      color: #155724; font-size: 0.85rem; font-weight: 600; text-align: center;
      animation: fadeIn 0.3s ease;
    }

    .profile-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .section-subtitle { font-size: 0.95rem; color: var(--primary); margin: 16px 0 10px; border-bottom: 1px solid var(--gray-200); padding-bottom: 6px; }
    .bg-light { background: var(--gray-100); }

    .form-actions { display: flex; align-items: center; gap: 14px; }
    .save-success { font-size: 0.85rem; color: #16a34a; font-weight: 600; }

    .side-hub { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .hub-block h3 { margin: 0 0 4px; color: var(--primary); font-size: 1.15rem; }
    .hub-sub { font-size: 0.82rem; color: var(--gray-500); margin-bottom: 16px; }
    .hub-actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-block { width: 100%; text-align: center; }

    .hub-tip {
      display: flex; align-items: flex-start; gap: 10px; padding: 12px;
      background: var(--gray-50); border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
    }
    .hub-tip span { font-size: 1.2rem; }
    .hub-tip p { font-size: 0.78rem; color: var(--gray-600); margin: 0; line-height: 1.4; }

    .verify-list { display: flex; flex-direction: column; gap: 10px; }
    .verify-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--gray-50); border-radius: var(--radius-sm); font-size: 0.85rem; }
    .v-icon { font-size: 1rem; }

    @media (max-width: 840px) {
      .roles-grid { grid-template-columns: 1fr; }
      .profile-grid { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  editData: any = {};
  vehicleData = {
    model: 'Renault Clio 4 (Blanche)',
    plate: '214 TN 5421'
  };

  myPublishedTripsCount = 0;
  myBookingsCount = 0;
  roleSwitchedMessage = '';
  saving = false;
  saveSuccess = false;

  private userSub!: Subscription;

  constructor(
    private authService: AuthService,
    private tripStore: TripStoreService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.editData = {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone || '+216 98 450 120',
          city: u.city || 'Tunis',
          bio: u.role === 'CONDUCTEUR'
            ? 'Conducteur ponctuel et prudent. Trajets quotidiens directs, véhicule propre et climatisé.'
            : 'Passager régulier et respectueux. Voyage principalement sur l\'axe Ariana - Lac 2.'
        };
        this.loadUserCounts(u);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  private loadUserCounts(u: User): void {
    this.myPublishedTripsCount = this.tripStore.getDriverTrips(u.id).length;
    this.myBookingsCount = this.tripStore.getPassengerBookings(u.id).length;
  }

  selectRole(role: 'CONDUCTEUR' | 'PASSAGER' | 'ADMIN'): void {
    if (!this.user || this.user.role === role) return;

    const updated = this.authService.switchRole(role);
    if (updated) {
      this.roleSwitchedMessage = `🎉 Rôle mis à jour avec succès : vous êtes maintenant en Mode ${this.getRoleDisplayLabel(role)} !`;
      setTimeout(() => {
        this.roleSwitchedMessage = '';
      }, 4000);
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.saveSuccess = false;

    setTimeout(() => {
      this.authService.updateProfile({
        firstName: this.editData.firstName,
        lastName: this.editData.lastName,
        phone: this.editData.phone,
        city: this.editData.city
      });
      this.saving = false;
      this.saveSuccess = true;
      setTimeout(() => {
        this.saveSuccess = false;
      }, 3500);
    }, 400);
  }

  getRoleDisplayLabel(role: string): string {
    switch (role) {
      case 'CONDUCTEUR': return 'Conducteur';
      case 'PASSAGER': return 'Passager';
      case 'ADMIN': return 'Administrateur';
      default: return role;
    }
  }

  getRoleAvatarClass(): string {
    return `role-${(this.user?.role || 'passager').toLowerCase()}`;
  }
}
