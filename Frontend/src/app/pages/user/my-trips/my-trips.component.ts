import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripStoreService, StoredTrip, StoredBooking, TripStatus } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';
import { GeolocationService } from '../../../core/services/geolocation.service';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-trips-page">
      <!-- Passenger blocked view -->
      <div class="card blocked-card" *ngIf="currentUser && currentUser.role === 'PASSAGER'">
        <div class="blocked-icon">🧑‍💼</div>
        <h2>Espace Réservé aux Conducteurs</h2>
        <p>Votre profil est actuellement configuré en tant que <strong>Passager</strong>.<br>
        La page "Mes Trajets" est réservée aux conducteurs pour gérer leurs annonces de véhicules. Vos réservations se trouvent dans votre espace réservations.</p>
        <div class="blocked-actions">
          <a routerLink="/user/bookings" class="btn btn-primary btn-lg">📋 Consulter mes réservations</a>
          <button type="button" class="btn btn-outline btn-lg" (click)="becomeDriver()">🚗 Basculer en mode Conducteur</button>
        </div>
      </div>

      <ng-container *ngIf="!currentUser || currentUser.role !== 'PASSAGER'">
        <div class="page-header">
          <div>
            <h1>🚗 Mes Trajets (Espace Conducteur)</h1>
            <p>Gérez vos trajets, activez-les pour les passagers, et suivez les réservations</p>
          </div>
          <a routerLink="/user/publish-trip" class="btn btn-primary">➕ Nouveau Trajet</a>
        </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab==='all'" (click)="activeTab='all'">
          Tous <span class="tab-count">{{ myTrips.length }}</span>
        </button>
        <button [class.active]="activeTab==='BROUILLON'" (click)="activeTab='BROUILLON'">
          📝 Brouillons <span class="tab-count">{{ countByStatus('BROUILLON') }}</span>
        </button>
        <button [class.active]="activeTab==='ACTIF'" (click)="activeTab='ACTIF'">
          ✅ Actifs <span class="tab-count">{{ countByStatus('ACTIF') }}</span>
        </button>
        <button [class.active]="activeTab==='EN_COURS'" (click)="activeTab='EN_COURS'">
          🚗 En route <span class="tab-count">{{ countByStatus('EN_COURS') }}</span>
        </button>
        <button [class.active]="activeTab==='TERMINE'" (click)="activeTab='TERMINE'">
          📋 Historique <span class="tab-count">{{ countByStatus('TERMINE') + countByStatus('ANNULE') }}</span>
        </button>
      </div>

      <!-- Trip List -->
      <div class="trips-list">
        <div class="trip-item card" *ngFor="let trip of getFilteredTrips()">
          <div class="trip-left">
            <div class="trip-status-row">
              <span class="badge" [ngClass]="getStatusClass(trip.status)">{{ getStatusLabel(trip.status) }}</span>
              <span class="visibility-hint" *ngIf="trip.status === 'BROUILLON'">
                🔒 Non visible aux passagers
              </span>
              <span class="visibility-hint visible" *ngIf="trip.status === 'ACTIF'">
                👁️ Visible aux passagers
              </span>
            </div>

            <div class="trip-route">
              <span class="dot-s"></span>
              <strong>{{ trip.origin }}</strong>
              <span class="arrow">→</span>
              <span class="dot-e"></span>
              <strong>{{ trip.destination }}</strong>
            </div>

            <div class="trip-meta">
              <span>📅 {{ trip.date }}</span>
              <span>🕐 {{ trip.time }}</span>
              <span>💺 {{ trip.seats - trip.seatsBooked }}/{{ trip.seats }} places libres</span>
              <span>💰 {{ trip.price }} TND</span>
              <span>📏 {{ trip.distance }} km</span>
            </div>

            <!-- Bookings for this trip -->
            <div class="trip-bookings" *ngIf="getTripBookings(trip.id).length > 0">
              <div class="bookings-title">
                👥 {{ getTripBookings(trip.id).length }} réservation(s) :
              </div>
              <div class="booking-item" *ngFor="let bk of getTripBookings(trip.id)">
                <div class="bk-avatar">{{ bk.passengerInitials }}</div>
                <div class="bk-info">
                  <strong>{{ bk.passengerName }}</strong>
                  <span>{{ bk.seats }} place(s) · {{ bk.passengerPhone }}</span>
                </div>
                <span class="badge bk-badge" [ngClass]="getBookingStatusClass(bk.status)">{{ bk.status }}</span>
                <div class="bk-actions" *ngIf="bk.status === 'EN_ATTENTE'">
                  <button class="btn btn-success btn-xs" (click)="confirmBooking(bk.id)">✓ Accepter</button>
                  <button class="btn btn-danger btn-xs" (click)="cancelBooking(bk.id)">✗ Refuser</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="trip-actions">
            <!-- BROUILLON → Activate -->
            <button class="btn btn-success btn-sm" *ngIf="trip.status === 'BROUILLON'" (click)="activateTrip(trip.id)">
              ✅ Activer (rendre visible)
            </button>

            <!-- ACTIF → Deactivate or Start -->
            <button class="btn btn-primary btn-sm" *ngIf="trip.status === 'ACTIF' && hasConfirmedBookings(trip.id)" (click)="startTrip(trip.id)">
              🚗 Démarrer le trajet
            </button>
            <button class="btn btn-warning btn-sm" *ngIf="trip.status === 'ACTIF'" (click)="deactivateTrip(trip.id)">
              📝 Repasser en brouillon
            </button>

            <!-- EN_COURS → Share live location or finish -->
            <button class="btn btn-primary btn-sm live-btn" *ngIf="trip.status === 'EN_COURS'" (click)="shareLocation(trip.id)">
              📍 {{ isSharingLocation[trip.id] ? 'Position partagée ✓' : 'Partager ma position' }}
            </button>
            <button class="btn btn-success btn-sm" *ngIf="trip.status === 'EN_COURS'" (click)="finishTrip(trip.id)">
              🏁 Terminer le trajet
            </button>

            <!-- Cancel (for BROUILLON and ACTIF) -->
            <button class="btn btn-danger btn-sm" *ngIf="trip.status === 'BROUILLON' || trip.status === 'ACTIF'" (click)="cancelTrip(trip.id)">
              ✗ Annuler
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="getFilteredTrips().length === 0">
          <span class="empty-icon">🚗</span>
          <h3>Aucun trajet trouvé</h3>
          <p>Vous n'avez pas encore de trajet dans cette catégorie.</p>
          <a routerLink="/user/publish-trip" class="btn btn-primary">Publier mon premier trajet</a>
        </div>
      </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .my-trips-page { max-width: 960px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-header h1 { font-size: 1.5rem; color: var(--primary); margin-bottom: 4px; }
    .page-header p { color: var(--gray-500); font-size: 0.9rem; }

    .tabs {
      display: flex; gap: 4px; margin-bottom: 24px; background: var(--white); padding: 4px;
      border-radius: var(--radius); box-shadow: var(--shadow-sm); flex-wrap: wrap;
    }
    .tabs button {
      flex: 1; padding: 10px 14px; border: none; background: none; border-radius: var(--radius-sm);
      cursor: pointer; font-family: var(--font); font-weight: 500; font-size: 0.85rem;
      color: var(--gray-500); transition: var(--transition); white-space: nowrap;
    }
    .tabs button.active { background: var(--accent); color: white; }
    .tab-count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; font-size: 0.72rem; margin-left: 4px; }

    .trips-list { display: flex; flex-direction: column; gap: 16px; }
    .trip-item { display: flex; justify-content: space-between; gap: 20px; padding: 20px; align-items: flex-start; }
    .trip-left { flex: 1; display: flex; flex-direction: column; gap: 10px; }

    .trip-status-row { display: flex; align-items: center; gap: 10px; }
    .visibility-hint { font-size: 0.72rem; color: #dc3545; font-weight: 600; }
    .visibility-hint.visible { color: #28a745; }

    .trip-route { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; }
    .dot-s { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .dot-e { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); }
    .arrow { color: var(--gray-400); }
    .trip-meta { display: flex; gap: 14px; font-size: 0.8rem; color: var(--gray-500); flex-wrap: wrap; }

    .trip-bookings {
      margin-top: 6px; padding: 12px; background: var(--gray-50);
      border-radius: var(--radius-sm); border: 1px solid var(--gray-200);
    }
    .bookings-title { font-size: 0.82rem; font-weight: 700; color: var(--primary); margin-bottom: 8px; }
    .booking-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 0;
      border-bottom: 1px solid var(--gray-100);
    }
    .booking-item:last-child { border-bottom: none; }
    .bk-avatar {
      width: 32px; height: 32px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.72rem; flex-shrink: 0;
    }
    .bk-info { flex: 1; }
    .bk-info strong { display: block; font-size: 0.82rem; }
    .bk-info span { font-size: 0.72rem; color: var(--gray-500); }
    .bk-badge { font-size: 0.68rem; }
    .bk-actions { display: flex; gap: 4px; }
    .btn-xs { font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; }

    .trip-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; min-width: 180px; }
    .trip-actions .btn { text-align: center; font-size: 0.78rem; }

    .live-btn { animation: pulse-bg 2s ease-in-out infinite; }
    @keyframes pulse-bg {
      0%, 100% { box-shadow: 0 0 0 0 rgba(14,133,163,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(14,133,163,0); }
    }

    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { color: var(--primary); margin-bottom: 8px; }
    .empty-state p { color: var(--gray-500); margin-bottom: 20px; }

    .blocked-card { text-align: center; padding: 48px 24px; margin: 20px 0; }
    .blocked-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .blocked-card h2 { color: var(--primary); font-size: 1.4rem; margin-bottom: 12px; }
    .blocked-card p { color: var(--gray-600); max-width: 550px; margin: 0 auto 24px; line-height: 1.6; }
    .blocked-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 768px) {
      .trip-item { flex-direction: column; }
      .trip-actions { width: 100%; flex-direction: row; flex-wrap: wrap; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class MyTripsComponent implements OnInit {
  activeTab = 'all';
  myTrips: StoredTrip[] = [];
  currentUser: any = null;
  isSharingLocation: { [tripId: number]: boolean } = {};
  private watchIds: { [tripId: number]: number } = {};

  constructor(
    private tripStore: TripStoreService,
    private authService: AuthService,
    private geoService: GeolocationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.loadMyTrips();
    });
    this.tripStore.trips$.subscribe(() => this.loadMyTrips());
  }

  becomeDriver(): void {
    this.authService.switchRole('CONDUCTEUR');
  }

  private loadMyTrips(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.myTrips = this.tripStore.getDriverTrips(user.id);
    } else {
      // Show all for demo
      this.myTrips = this.tripStore.getAllTrips();
    }
  }

  countByStatus(status: TripStatus): number {
    return this.myTrips.filter(t => t.status === status).length;
  }

  getFilteredTrips(): StoredTrip[] {
    if (this.activeTab === 'all') return this.myTrips;
    if (this.activeTab === 'TERMINE') {
      return this.myTrips.filter(t => t.status === 'TERMINE' || t.status === 'ANNULE');
    }
    return this.myTrips.filter(t => t.status === this.activeTab);
  }

  getTripBookings(tripId: number): StoredBooking[] {
    return this.tripStore.getTripBookings(tripId);
  }

  hasConfirmedBookings(tripId: number): boolean {
    return this.getTripBookings(tripId).some(b => b.status === 'CONFIRMEE');
  }

  // ─── Trip Status Actions ────────────────────────────────

  activateTrip(tripId: number): void {
    this.tripStore.activateTrip(tripId);
    alert('✅ Trajet activé ! Il est maintenant visible aux passagers dans la recherche.');
  }

  deactivateTrip(tripId: number): void {
    this.tripStore.deactivateTrip(tripId);
    alert('📝 Trajet repassé en brouillon. Il n\'est plus visible aux passagers.');
  }

  startTrip(tripId: number): void {
    this.tripStore.startTrip(tripId);
    alert('🚗 Trajet démarré ! Les passagers peuvent maintenant suivre votre position en temps réel.\nCliquez sur "Partager ma position" pour activer le GPS.');
  }

  finishTrip(tripId: number): void {
    // Stop sharing location
    if (this.watchIds[tripId]) {
      navigator.geolocation.clearWatch(this.watchIds[tripId]);
      delete this.watchIds[tripId];
      delete this.isSharingLocation[tripId];
    }
    this.tripStore.finishTrip(tripId);
    alert('🏁 Trajet terminé avec succès ! Merci d\'avoir utilisé SmartRide.');
  }

  cancelTrip(tripId: number): void {
    if (confirm('⚠️ Êtes-vous sûr de vouloir annuler ce trajet ?')) {
      this.tripStore.cancelTrip(tripId);
    }
  }

  // ─── Booking Actions ────────────────────────────────────

  confirmBooking(bookingId: number): void {
    this.tripStore.confirmBooking(bookingId);
    alert('✅ Réservation acceptée ! Le passager sera notifié.');
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Refuser cette réservation ?')) {
      this.tripStore.cancelBooking(bookingId);
    }
  }

  // ─── Live Location Sharing ──────────────────────────────

  shareLocation(tripId: number): void {
    if (this.isSharingLocation[tripId]) return; // Already sharing

    if (!navigator.geolocation) {
      alert('❌ La géolocalisation n\'est pas disponible sur ce navigateur.');
      return;
    }

    this.isSharingLocation[tripId] = true;

    // Watch driver position continuously
    this.watchIds[tripId] = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.tripStore.updateDriverLocation(tripId, lat, lng);
      },
      (error) => {
        console.warn('Erreur GPS conducteur:', error.message);
        // Fallback: simulate location near Tunis
        this.simulateDriverPosition(tripId);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }
    );
  }

  /** Simulates driver movement for desktop demo (no real GPS chip) */
  private simulateDriverPosition(tripId: number): void {
    const trip = this.tripStore.getTripById(tripId);
    if (!trip) return;

    let progress = 0;
    const interval = setInterval(() => {
      if (!this.isSharingLocation[tripId] || progress >= 1) {
        clearInterval(interval);
        return;
      }
      progress += 0.02;
      const lat = trip.originLat + (trip.destLat - trip.originLat) * progress;
      const lng = trip.originLng + (trip.destLng - trip.originLng) * progress;
      this.tripStore.updateDriverLocation(tripId, lat, lng);
    }, 3000);
  }

  // ─── Helpers ────────────────────────────────────────────

  getStatusClass(status: TripStatus) {
    return {
      'badge-warning': status === 'BROUILLON',
      'badge-success': status === 'ACTIF',
      'badge-primary': status === 'EN_COURS',
      'badge-info': status === 'TERMINE',
      'badge-danger': status === 'ANNULE'
    };
  }

  getStatusLabel(status: TripStatus): string {
    const labels: Record<TripStatus, string> = {
      'BROUILLON': '📝 Brouillon',
      'ACTIF': '✅ Actif',
      'EN_COURS': '🚗 En route',
      'TERMINE': '✔️ Terminé',
      'ANNULE': '❌ Annulé'
    };
    return labels[status] || status;
  }

  getBookingStatusClass(status: string) {
    return {
      'badge-warning': status === 'EN_ATTENTE',
      'badge-success': status === 'CONFIRMEE',
      'badge-primary': status === 'EN_COURS',
      'badge-info': status === 'TERMINEE',
      'badge-danger': status === 'ANNULEE'
    };
  }
}
