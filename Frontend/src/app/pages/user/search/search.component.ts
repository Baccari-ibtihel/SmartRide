import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';
import { GeolocationService, UserCurrentLocation } from '../../../core/services/geolocation.service';
import { TripStoreService, StoredTrip } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MapViewComponent],
  template: `
    <div class="search-page animate-fade">
      <div class="search-header">
        <h1>🔍 Recherche de Trajet & Matching par IA</h1>
        <p>Espace Passager : Trouvez les correspondances optimales avec géolocalisation en temps réel</p>
      </div>

      <!-- Search Form -->
      <div class="search-card card">
        <div class="search-form">
          <div class="form-group flex-2">
            <label>Point de départ</label>
            <div class="input-with-geo">
              <input type="text" class="form-control" placeholder="Ex: Ariana, Tunis" [(ngModel)]="filters.origin">
              <button type="button" class="geo-btn" (click)="useMyLocation()" [title]="'Utiliser ma position GPS actuelle'">
                <span>{{ isGeolocating ? '⏳' : '📍' }}</span>
              </button>
            </div>
          </div>

          <div class="form-group flex-2">
            <label>Destination</label>
            <input type="text" class="form-control" placeholder="Ex: Les Berges du Lac 2" [(ngModel)]="filters.destination">
          </div>

          <div class="form-group flex-1">
            <label>Date</label>
            <input type="date" class="form-control" [(ngModel)]="filters.date">
          </div>

          <div class="form-group flex-1">
            <label>Places</label>
            <select class="form-control" [(ngModel)]="filters.seats">
              <option value="1">1 place</option>
              <option value="2">2 places</option>
              <option value="3">3 places</option>
              <option value="4">4+ places</option>
            </select>
          </div>

          <button class="btn btn-primary btn-lg search-btn" (click)="search()">
            ⚡ Calculer Correspondances IA
          </button>
        </div>

        <div class="geo-banner" *ngIf="userLocation">
          <span>🎯 Votre position détectée : <strong>{{ userLocation.cityName }}</strong> (GPS: {{ userLocation.lat.toFixed(4) }}, {{ userLocation.lng.toFixed(4) }})</span>
        </div>
      </div>

      <!-- Info banner: only ACTIF trips -->
      <div class="info-banner" *ngIf="totalTrips > filteredResults.length">
        <span>ℹ️ Seuls les trajets <strong>activés par leurs conducteurs</strong> sont affichés. {{ filteredResults.length }} trajet(s) disponible(s) sur {{ totalTrips }} au total.</span>
      </div>

      <!-- Main Layout: Map & Results Grid -->
      <div class="search-content-grid">
        <!-- Interactive Map Preview -->
        <div class="map-sidebar">
          <app-map-view
            [originLat]="selectedTrip ? selectedTrip.originLat : currentOriginLat"
            [originLng]="selectedTrip ? selectedTrip.originLng : currentOriginLng"
            [originLabel]="selectedTrip ? selectedTrip.origin : 'Départ'"
            [destLat]="selectedTrip ? selectedTrip.destLat : currentDestLat"
            [destLng]="selectedTrip ? selectedTrip.destLng : currentDestLng"
            [destLabel]="selectedTrip ? selectedTrip.destination : 'Arrivée'"
            (locationSelected)="onMapLocationPicked($event)"
          ></app-map-view>
        </div>

        <!-- Results List -->
        <div class="results-column">
          <div class="results-header">
            <h2>{{ filteredResults.length }} trajets disponibles</h2>
            <div class="sort-bar">
              <span>Trier par :</span>
              <button [class.active]="sortBy==='score'" (click)="setSort('score')">Score IA</button>
              <button [class.active]="sortBy==='proximity'" (click)="setSort('proximity')">Proximité GPS</button>
              <button [class.active]="sortBy==='price'" (click)="setSort('price')">Prix</button>
            </div>
          </div>

          <div class="results-list">
            <div
              class="result-card card"
              *ngFor="let trip of filteredResults"
              [class.selected-card]="selectedTrip?.id === trip.id"
              (click)="selectTrip(trip)"
            >
              <div class="result-top">
                <div class="driver-info">
                  <div class="avatar">{{ trip.driverInitials }}</div>
                  <div>
                    <strong>{{ trip.driverName }}</strong>
                    <div class="driver-meta">⭐ {{ trip.driverRating }} · {{ trip.driverTripsCount }} trajets effectués</div>
                  </div>
                </div>

                <div class="score-circle" [class.high]="trip.score >= 90">
                  <span class="score-val">{{ trip.score }}%</span>
                  <span class="score-label">Match IA</span>
                </div>
              </div>

              <div class="result-route">
                <div class="time-col">
                  <span class="time-dep">{{ trip.time }}</span>
                  <span class="duration">{{ trip.duration }}</span>
                  <span class="time-arr">{{ getArrivalTime(trip) }}</span>
                </div>
                <div class="route-visual">
                  <span class="dot-start"></span>
                  <span class="route-bar"></span>
                  <span class="dot-end"></span>
                </div>
                <div class="place-col">
                  <strong>{{ trip.origin }}</strong>
                  <span class="distance" *ngIf="trip.distanceFromUser !== undefined">
                    📍 À seulement {{ trip.distanceFromUser }} km de vous !
                  </span>
                  <strong>{{ trip.destination }}</strong>
                </div>
              </div>

              <div class="result-bottom">
                <div class="meta-tags">
                  <span class="tag">💺 {{ trip.seats - trip.seatsBooked }} places libres</span>
                  <span class="tag" *ngIf="trip.verified">✅ Conducteur Vérifié</span>
                  <span class="tag" *ngIf="trip.recurring">🔄 Trajet quotidien</span>
                  <span class="tag" *ngIf="trip.nonSmoker">🚭 Non-fumeur</span>
                </div>
                <div class="result-actions">
                  <span class="price">{{ trip.price }} TND</span>
                  <a [routerLink]="['/user/trip', trip.id]" class="btn btn-outline btn-sm" (click)="$event.stopPropagation()">
                    Détails
                  </a>
                  <button
                    class="btn btn-primary btn-sm"
                    (click)="bookTrip(trip, $event)"
                    [disabled]="trip.seats - trip.seatsBooked <= 0"
                  >
                    {{ trip.seats - trip.seatsBooked <= 0 ? 'Complet' : 'Réserver' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div class="empty-state" *ngIf="filteredResults.length === 0">
              <span class="empty-icon">🔍</span>
              <h3>Aucun trajet actif trouvé</h3>
              <p>Les conducteurs n'ont pas encore activé de trajet correspondant à votre recherche.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page { max-width: 1280px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .search-header h1 { font-size: 1.6rem; color: var(--primary); font-weight: 800; }
    .search-header p { color: var(--gray-500); font-size: 0.9rem; }

    .search-card { padding: 20px; }
    .search-form { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 120px; }
    .flex-2 { flex: 2; min-width: 200px; }
    .search-btn { height: 44px; white-space: nowrap; font-weight: 700; }

    .input-with-geo { position: relative; display: flex; align-items: center; }
    .geo-btn {
      position: absolute; right: 8px; background: none; border: none;
      cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 4px;
      transition: var(--transition);
    }
    .geo-btn:hover { background: var(--gray-100); }

    .geo-banner {
      margin-top: 14px; padding: 10px 14px; background: rgba(14,133,163,0.08);
      border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
      font-size: 0.85rem; color: var(--secondary);
    }
    .info-banner {
      padding: 10px 14px; background: rgba(255,193,7,0.1);
      border-radius: var(--radius-sm); border-left: 3px solid #ffc107;
      font-size: 0.82rem; color: #856404;
    }

    .search-content-grid { display: grid; grid-template-columns: 420px 1fr; gap: 24px; align-items: flex-start; }
    .map-sidebar { position: sticky; top: 80px; }

    .results-column { display: flex; flex-direction: column; gap: 16px; }
    .results-header { display: flex; justify-content: space-between; align-items: center; }
    .results-header h2 { font-size: 1.15rem; color: var(--primary); }

    .sort-bar { display: flex; align-items: center; gap: 6px; }
    .sort-bar span { font-size: 0.82rem; color: var(--gray-500); }
    .sort-bar button {
      background: var(--gray-100); border: none; padding: 6px 12px; border-radius: 20px;
      font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: var(--transition);
    }
    .sort-bar button.active { background: var(--accent); color: white; }

    .results-list { display: flex; flex-direction: column; gap: 12px; }
    .result-card {
      padding: 18px; cursor: pointer; transition: var(--transition);
      border: 2px solid transparent;
    }
    .result-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); border-color: var(--accent-light); }
    .result-card.selected-card { border-color: var(--accent); background: rgba(14,133,163,0.02); }

    .result-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .driver-info { display: flex; align-items: center; gap: 10px; }
    .driver-meta { font-size: 0.75rem; color: var(--gray-500); }

    .score-circle {
      width: 54px; height: 54px; border-radius: 50%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; background: rgba(14,133,163,0.1);
      border: 2px solid var(--accent); flex-shrink: 0;
    }
    .score-circle.high { background: rgba(40,167,69,0.1); border-color: var(--success); }
    .score-val { font-size: 0.95rem; font-weight: 800; color: var(--primary); }
    .score-label { font-size: 0.55rem; text-transform: uppercase; font-weight: 700; color: var(--gray-500); }

    .result-route { display: flex; gap: 14px; padding: 12px 0; border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100); font-size: 0.88rem; }
    .time-col { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; min-width: 45px; font-weight: 700; }
    .duration { font-size: 0.7rem; color: var(--gray-400); font-weight: normal; }
    .route-visual { display: flex; flex-direction: column; align-items: center; gap: 0; }
    .dot-start { width: 8px; height: 8px; border-radius: 50%; background: var(--success); }
    .dot-end { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); }
    .route-bar { width: 2px; flex: 1; min-height: 25px; background: var(--gray-300); }
    .place-col { display: flex; flex-direction: column; justify-content: space-between; flex: 1; }
    .distance { font-size: 0.75rem; color: var(--accent); font-weight: 600; }

    .result-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; }
    .meta-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag { font-size: 0.72rem; padding: 2px 8px; background: var(--gray-100); border-radius: 12px; }
    .result-actions { display: flex; align-items: center; gap: 12px; }
    .price { font-size: 1.25rem; font-weight: 800; color: var(--accent); }

    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
    .empty-state h3 { color: var(--gray-500); margin-bottom: 8px; }
    .empty-state p { color: var(--gray-500); font-size: 0.9rem; }

    @media (max-width: 960px) {
      .search-content-grid { grid-template-columns: 1fr; }
      .map-sidebar { position: static; }
    }
  `]
})
export class SearchComponent implements OnInit {
  filters = {
    origin: '',
    destination: '',
    date: new Date().toISOString().substring(0, 10),
    seats: '1'
  };

  sortBy = 'score';
  isGeolocating = false;
  userLocation: UserCurrentLocation | null = null;

  currentOriginLat = 36.8970;
  currentOriginLng = 10.1895;
  currentDestLat = 36.8392;
  currentDestLng = 10.2372;

  selectedTrip: (StoredTrip & { distanceFromUser?: number }) | null = null;
  totalTrips = 0;

  private activeTrips: (StoredTrip & { distanceFromUser?: number })[] = [];

  constructor(
    private geoService: GeolocationService,
    private tripStore: TripStoreService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrips();
    // Subscribe to trip changes (e.g. driver activates or publishes a trip live)
    this.tripStore.trips$.subscribe(() => {
      this.loadTrips();
    });

    // Auto-reload whenever page gains focus or storage changes across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.loadTrips());
      window.addEventListener('storage', () => this.loadTrips());
    }
  }

  private loadTrips(): void {
    // Only show ACTIF trips to passengers — driver's BROUILLON trips are HIDDEN
    this.activeTrips = this.tripStore.getActiveTrips().map(t => ({
      ...t,
      distanceFromUser: undefined as number | undefined
    }));
    this.totalTrips = this.tripStore.getAllTrips().length;

    if (this.activeTrips.length > 0 && !this.selectedTrip) {
      this.selectedTrip = this.activeTrips[0];
    }
  }

  get filteredResults(): (StoredTrip & { distanceFromUser?: number })[] {
    let list = [...this.activeTrips];

    if (this.filters.origin) {
      const q = this.filters.origin.toLowerCase();
      list = list.filter(t => t.origin.toLowerCase().includes(q));
    }
    if (this.filters.destination) {
      const q = this.filters.destination.toLowerCase();
      list = list.filter(t => t.destination.toLowerCase().includes(q));
    }

    // Filter by available seats
    const requestedSeats = parseInt(this.filters.seats, 10) || 1;
    list = list.filter(t => (t.seats - t.seatsBooked) >= requestedSeats);

    if (this.sortBy === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else if (this.sortBy === 'proximity') {
      list.sort((a, b) => (a.distanceFromUser || 999) - (b.distanceFromUser || 999));
    } else if (this.sortBy === 'price') {
      list.sort((a, b) => a.price - b.price);
    }

    return list;
  }

  useMyLocation(): void {
    this.isGeolocating = true;
    this.geoService.requestLiveLocation().then(loc => {
      this.isGeolocating = false;
      this.userLocation = loc;
      this.filters.origin = loc.cityName;
      this.currentOriginLat = loc.lat;
      this.currentOriginLng = loc.lng;

      // Compute live proximity to each trip departure point
      this.activeTrips.forEach(t => {
        t.distanceFromUser = this.geoService.calculateDistance(loc.lat, loc.lng, t.originLat, t.originLng);
      });

      this.sortBy = 'proximity';
    }).catch(() => {
      this.isGeolocating = false;
    });
  }

  search(): void {
    // Recalculate — results are already reactive via getter
  }

  selectTrip(trip: StoredTrip & { distanceFromUser?: number }): void {
    this.selectedTrip = trip;
    this.currentOriginLat = trip.originLat;
    this.currentOriginLng = trip.originLng;
    this.currentDestLat = trip.destLat;
    this.currentDestLng = trip.destLng;
  }

  setSort(type: string): void {
    this.sortBy = type;
  }

  onMapLocationPicked(event: { type: 'origin' | 'dest', lat: number, lng: number, name: string }): void {
    if (event.type === 'origin') {
      this.filters.origin = event.name;
      this.currentOriginLat = event.lat;
      this.currentOriginLng = event.lng;
    } else {
      this.filters.destination = event.name;
      this.currentDestLat = event.lat;
      this.currentDestLng = event.lng;
    }
  }

  getArrivalTime(trip: StoredTrip): string {
    if (!trip.time) return '';
    const [h, m] = trip.time.split(':').map(Number);
    const durMin = parseInt(trip.duration, 10) || 30;
    const totalMin = h * 60 + m + durMin;
    const ah = Math.floor(totalMin / 60) % 24;
    const am = totalMin % 60;
    return `${ah.toString().padStart(2, '0')}:${am.toString().padStart(2, '0')}`;
  }

  bookTrip(trip: StoredTrip, event: Event): void {
    event.stopPropagation();

    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('⚠️ Vous devez vous connecter pour réserver un trajet.');
      return;
    }

    const seats = parseInt(this.filters.seats, 10) || 1;
    const booking = this.tripStore.bookTrip(
      trip.id,
      user.id,
      `${user.firstName} ${user.lastName}`,
      user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase(),
      user.phone || '+216 00 000 000',
      seats
    );

    if (booking) {
      const follow = confirm(
        `🎉 Réservation enregistrée !\n\n` +
        `📍 ${trip.origin} ➔ ${trip.destination}\n` +
        `🚗 Conducteur : ${trip.driverName}\n` +
        `💰 Tarif : ${trip.price} TND\n\n` +
        `👉 Souhaitez-vous suivre la position du conducteur en temps réel sur la carte ?`
      );
      if (follow) {
        this.router.navigate(['/user/tracking', booking.id]);
      } else {
        this.loadTrips();
      }
    } else {
      alert('❌ Réservation impossible : vérifiez les places disponibles ou si vous avez déjà réservé ce trajet.');
    }
  }
}
