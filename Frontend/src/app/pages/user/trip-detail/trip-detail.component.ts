import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TripStoreService, StoredTrip, StoredReview } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MapViewComponent, FormsModule],
  template: `
    <div class="detail-page" *ngIf="trip">
      <a routerLink="/user/search" class="back-link">← Retour aux résultats</a>

      <div class="detail-grid">
        <!-- Main Info -->
        <div class="main-col">
          <!-- Interactive Map -->
          <div class="map-box mb-3">
            <app-map-view
              [originLat]="trip.originLat"
              [originLng]="trip.originLng"
              [originLabel]="trip.origin"
              [destLat]="trip.destLat"
              [destLng]="trip.destLng"
              [destLabel]="trip.destination"
              [interactive]="false"
            ></app-map-view>
          </div>

          <!-- Route Details -->
          <div class="card route-card">
            <h3>Détails de l'itinéraire</h3>
            <div class="route-info">
              <div class="route-stop">
                <div class="stop-time">{{ trip.time }}</div>
                <div class="stop-dot origin"></div>
                <div class="stop-info">
                  <strong>{{ trip.origin }}</strong>
                  <span>Point de départ</span>
                </div>
              </div>
              <div class="route-connector">
                <span class="connector-line"></span>
                <span class="connector-info">{{ trip.duration }} · {{ trip.distance }} km</span>
              </div>
              <div class="route-stop">
                <div class="stop-time">{{ getArrivalTime() }}</div>
                <div class="stop-dot dest"></div>
                <div class="stop-info">
                  <strong>{{ trip.destination }}</strong>
                  <span>Point d'arrivée</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="card mt-3">
            <h3>Description & Préférences</h3>
            <p class="trip-desc">{{ trip.description || 'Conducteur ponctuel, trajet direct et agréable.' }}</p>
            <div class="prefs-list mt-2">
              <span class="pref-badge" *ngIf="trip.nonSmoker">🚭 Non-fumeur</span>
              <span class="pref-badge" *ngIf="trip.music">🎵 Musique autorisée</span>
              <span class="pref-badge" *ngIf="trip.recurring">🔄 Trajet quotidien régulier</span>
              <span class="pref-badge" *ngIf="trip.verified">✅ Conducteur certifié</span>
            </div>
          </div>

          <!-- Reviews -->
          <div class="card mt-3">
            <div class="reviews-header-bar">
              <h3>Avis sur le conducteur ({{ reviews.length }})</h3>
              <button class="btn btn-sm btn-outline" (click)="showReviewForm = !showReviewForm">
                {{ showReviewForm ? '✕ Fermer' : '✍️ Donner un avis' }}
              </button>
            </div>

            <!-- Review form box -->
            <div class="review-form-card" *ngIf="showReviewForm">
              <h4>Évaluer ce conducteur / trajet</h4>
              <div class="star-picker mb-2">
                <span *ngFor="let s of [1,2,3,4,5]" class="star-btn" [class.active]="newScore >= s" (click)="newScore = s">★</span>
                <span class="score-lbl">{{ newScore }} / 5 étoiles</span>
              </div>
              <div class="form-group mb-2">
                <textarea class="form-control" rows="2" placeholder="Partagez votre avis sur ce trajet..." [(ngModel)]="newComment"></textarea>
              </div>
              <button class="btn btn-sm btn-primary" (click)="submitReview()">
                ✓ Publier mon avis
              </button>
            </div>

            <div class="reviews-list">
              <div class="review-item" *ngFor="let r of reviews">
                <div class="review-header">
                  <div class="avatar avatar-sm">{{ r.initials }}</div>
                  <div>
                    <strong>{{ r.name }}</strong>
                    <span class="review-stars">{{ '⭐'.repeat(r.score) }}</span>
                  </div>
                  <span class="review-date">{{ r.date }}</span>
                </div>
                <p class="review-text">{{ r.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="side-col">
          <!-- Driver Card -->
          <div class="card driver-card">
            <div class="driver-top">
              <div class="avatar avatar-lg">{{ trip.driverInitials }}</div>
              <div>
                <h3>{{ trip.driverName }}</h3>
                <div class="driver-badges">
                  <span class="badge badge-success" *ngIf="trip.verified">✅ Vérifié</span>
                  <span class="badge badge-primary">⭐ {{ trip.driverRating }}</span>
                </div>
              </div>
            </div>
            <div class="driver-stats">
              <div class="dstat"><strong>{{ trip.driverTripsCount }}</strong><span>Trajets</span></div>
              <div class="dstat"><strong>{{ trip.driverRating }}</strong><span>Note</span></div>
              <div class="dstat"><strong>98%</strong><span>Fiabilité</span></div>
            </div>
            <p class="member-since">Conducteur vérifié SmartRide Tunisie</p>
          </div>

          <!-- Booking Card -->
          <div class="card booking-card mt-3">
            <div class="price-display">
              <span class="price-value">{{ trip.price }} TND</span>
              <span class="price-per">par place</span>
            </div>
            <div class="booking-info">
              <div class="binfo"><span>🕐</span><span>{{ trip.time }} → {{ getArrivalTime() }}</span></div>
              <div class="binfo"><span>📅</span><span>{{ trip.date }}</span></div>
              <div class="binfo"><span>💺</span><span>{{ trip.seats - trip.seatsBooked }} places disponibles</span></div>
            </div>
            <div class="seats-select">
              <label>Nombre de places :</label>
              <div class="seats-btns">
                <button *ngFor="let n of [1,2,3]" [class.active]="selectedSeats===n" (click)="selectedSeats=n" [disabled]="n > (trip.seats - trip.seatsBooked)">{{ n }}</button>
              </div>
            </div>
            <div class="total-price">
              <span>Total :</span>
              <strong>{{ (trip.price * selectedSeats).toFixed(1) }} TND</strong>
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%;" (click)="bookThisTrip()" [disabled]="(trip.seats - trip.seatsBooked) <= 0">
              {{ (trip.seats - trip.seatsBooked) <= 0 ? 'Trajet Complet' : 'Réserver ce trajet' }}
            </button>

            <!-- Direct Live Tracking Link if already booked -->
            <a [routerLink]="['/user/tracking', trip.id]" class="btn btn-success mt-2" style="width:100%; text-align:center;">
              📍 Suivre le conducteur en direct
            </a>
          </div>

          <!-- Match Score -->
          <div class="card match-card mt-3">
            <h4>Score de Matching IA</h4>
            <div class="match-display">
              <div class="match-circle">
                <span class="match-val">{{ trip.score }}%</span>
              </div>
              <div class="match-details">
                <div class="match-item"><span>Itinéraire</span><div class="bar"><div class="bar-fill" style="width:96%"></div></div></div>
                <div class="match-item"><span>Horaire</span><div class="bar"><div class="bar-fill" style="width:92%"></div></div></div>
                <div class="match-item"><span>Préférences</span><div class="bar"><div class="bar-fill" style="width:88%"></div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-page" *ngIf="!trip">
      <div class="card text-center p-5">
        <h2>Trajet introuvable</h2>
        <p class="text-muted">Ce trajet n'existe pas ou a été retiré.</p>
        <a routerLink="/user/search" class="btn btn-primary mt-3">Retour à la recherche</a>
      </div>
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .back-link { display: inline-block; margin-bottom: 20px; color: var(--gray-500); font-size: 0.9rem; text-decoration: none; }
    .back-link:hover { color: var(--accent); }

    .detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
    .mb-3 { margin-bottom: 20px; }
    .mt-2 { margin-top: 12px; }
    .mt-3 { margin-top: 20px; }

    .route-card h3 { margin-bottom: 20px; color: var(--primary); }
    .route-info { padding-left: 8px; }
    .route-stop { display: flex; align-items: center; gap: 16px; }
    .stop-time { font-weight: 700; font-size: 1.1rem; min-width: 50px; color: var(--primary); }
    .stop-dot { width: 14px; height: 14px; border-radius: 50%; }
    .stop-dot.origin { background: var(--accent); }
    .stop-dot.dest { background: var(--danger); }
    .stop-info strong { display: block; }
    .stop-info span { font-size: 0.8rem; color: var(--gray-500); }
    .route-connector { display: flex; align-items: center; gap: 12px; padding: 8px 0 8px 66px; }
    .connector-line { width: 2px; height: 30px; background: var(--gray-200); margin-left: 6px; }
    .connector-info { font-size: 0.8rem; color: var(--gray-400); }

    .trip-desc { color: var(--gray-600); line-height: 1.8; }
    .prefs-list { display: flex; gap: 8px; flex-wrap: wrap; }
    .pref-badge { background: var(--gray-100); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; color: var(--gray-700); }

    .reviews-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .review-form-card { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; }
    .review-form-card h4 { font-size: 0.95rem; margin-bottom: 8px; color: var(--primary); }
    .star-btn { font-size: 1.4rem; cursor: pointer; color: var(--gray-300); transition: color 0.15s; margin-right: 2px; }
    .star-btn.active { color: #f59e0b; }
    .score-lbl { font-size: 0.82rem; font-weight: 600; color: var(--gray-600); margin-left: 8px; }

    .reviews-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .review-item { padding: 16px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .review-stars { font-size: 0.8rem; margin-left: 4px; }
    .review-date { margin-left: auto; font-size: 0.8rem; color: var(--gray-400); }
    .review-text { font-size: 0.9rem; color: var(--gray-600); }

    .driver-card .driver-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .driver-card h3 { margin-bottom: 6px; }
    .driver-badges { display: flex; gap: 6px; }
    .driver-stats { display: flex; justify-content: space-around; padding: 16px 0; border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100); }
    .dstat { text-align: center; }
    .dstat strong { display: block; font-size: 1.1rem; color: var(--primary); }
    .dstat span { font-size: 0.75rem; color: var(--gray-500); }
    .member-since { text-align: center; font-size: 0.8rem; color: var(--gray-400); margin-top: 12px; }

    .booking-card { border: 2px solid var(--accent); }
    .price-display { text-align: center; margin-bottom: 20px; }
    .price-value { font-size: 2rem; font-weight: 800; color: var(--accent); }
    .price-per { display: block; font-size: 0.8rem; color: var(--gray-500); }
    .booking-info { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .binfo { display: flex; gap: 10px; font-size: 0.9rem; }
    .seats-select { margin-bottom: 16px; }
    .seats-select label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; }
    .seats-btns { display: flex; gap: 8px; }
    .seats-btns button {
      width: 44px; height: 44px; border: 2px solid var(--gray-200); border-radius: var(--radius-sm);
      background: var(--white); cursor: pointer; font-weight: 700; transition: var(--transition); font-size: 1rem;
    }
    .seats-btns button.active { border-color: var(--accent); background: rgba(14,133,163,0.1); color: var(--accent); }
    .seats-btns button:disabled { opacity: 0.3; cursor: not-allowed; }
    .total-price { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-bottom: 12px; border-top: 1px solid var(--gray-100); }
    .total-price strong { font-size: 1.3rem; color: var(--accent); }

    .match-card h4 { margin-bottom: 16px; color: var(--primary); }
    .match-display { display: flex; gap: 20px; align-items: center; }
    .match-circle {
      width: 72px; height: 72px; border-radius: 50%; background: rgba(40,167,69,0.1);
      border: 3px solid var(--success); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .match-val { font-size: 1.1rem; font-weight: 800; color: var(--success); }
    .match-details { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .match-item { display: flex; align-items: center; gap: 10px; }
    .match-item span { font-size: 0.8rem; min-width: 70px; color: var(--gray-600); }
    .bar { flex: 1; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--accent); border-radius: 3px; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TripDetailComponent implements OnInit {
  selectedSeats = 1;
  trip: StoredTrip | null = null;
  reviews: StoredReview[] = [];

  showReviewForm = false;
  newScore = 5;
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripStore: TripStoreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.trip = this.tripStore.getTripById(id) || null;
      this.reviews = this.tripStore.getReviews(id);
    }
  }

  submitReview(): void {
    if (!this.trip) return;
    const user = this.authService.getCurrentUser();
    const name = user ? `${user.firstName} ${user.lastName}` : 'Passager SmartRide';
    const initials = user?.avatar || 'PS';
    const comment = this.newComment.trim() || 'Trajet agréable et ponctuel.';
    this.tripStore.addReview(this.trip.id, name, initials, this.newScore, comment);
    this.reviews = this.tripStore.getReviews(this.trip.id);
    this.newComment = '';
    this.showReviewForm = false;
    alert('⭐ Votre avis a été enregistré et publié avec succès !');
  }

  getArrivalTime(): string {
    if (!this.trip?.time) return '';
    const [h, m] = this.trip.time.split(':').map(Number);
    const durMin = parseInt(this.trip.duration, 10) || 30;
    const totalMin = h * 60 + m + durMin;
    const ah = Math.floor(totalMin / 60) % 24;
    const am = totalMin % 60;
    return `${ah.toString().padStart(2, '0')}:${am.toString().padStart(2, '0')}`;
  }

  bookThisTrip(): void {
    if (!this.trip) return;
    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('⚠️ Vous devez être connecté pour réserver un trajet.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const booking = this.tripStore.bookTrip(
      this.trip.id,
      user.id,
      `${user.firstName} ${user.lastName}`,
      user.avatar || 'US',
      user.phone || '+216 00 000 000',
      this.selectedSeats
    );

    if (booking) {
      alert(`🎉 Réservation effectuée avec succès !\n\nVous pouvez maintenant suivre la position du conducteur en temps réel.`);
      this.router.navigate(['/user/tracking', booking.id]);
    } else {
      alert('❌ Impossible de réserver : places insuffisantes ou réservation déjà existante.');
    }
  }
}
