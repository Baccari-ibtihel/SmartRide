import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';
import { GeolocationService, UserCurrentLocation } from '../../../core/services/geolocation.service';
import { TripStoreService } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-publish-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MapViewComponent],
  template: `
    <div class="publish-page animate-fade">
      <div class="publish-header">
        <h1>🚗 Espace Conducteur : Publier un Trajet</h1>
        <p class="sub">Partagez votre véhicule, définissez vos étapes avec la carte GPS et rentabilisez vos trajets</p>
      </div>

      <!-- Step Indicator (Only if Driver) -->
      <div class="progress-bar" *ngIf="!currentUser || currentUser.role !== 'PASSAGER'">
        <div class="progress-step" *ngFor="let s of stepLabels; let i = index" [class.active]="step >= i+1" [class.done]="step > i+1">
          <div class="step-circle">{{ step > i+1 ? '✓' : i+1 }}</div>
          <span>{{ s }}</span>
        </div>
      </div>

      <!-- PASSENGER BLOCKED ACCESS CARD -->
      <div class="card blocked-access-card" *ngIf="currentUser && currentUser.role === 'PASSAGER'">
        <div class="blocked-icon">🛑</div>
        <h2>Accès Réservé aux Conducteurs</h2>
        <p>Votre compte est actuellement configuré en tant que <strong>Passager</strong>.<br>
        En tant que passager, vous ne pouvez pas publier d'annonces de covoiturage.</p>

        <div class="blocked-actions-box">
          <button type="button" class="btn btn-primary btn-lg" (click)="becomeDriver()">
            🚗 Activer le mode Conducteur
          </button>
          <a routerLink="/user/search" class="btn btn-outline btn-lg">
            🔍 Rechercher un trajet existant
          </a>
        </div>
      </div>

      <div class="publish-container" *ngIf="!currentUser || currentUser.role !== 'PASSAGER'">
        <!-- Form Section -->
        <div class="form-card card">
          <form [formGroup]="form">
            <!-- STEP 1: Itinéraire & Géolocalisation -->
            <div *ngIf="step === 1" class="step-content">
              <div class="step-title-row">
                <h2>📍 1. Itinéraire & Position GPS</h2>
                <button type="button" class="btn btn-sm btn-outline geo-shortcut-btn" (click)="locateCurrentDriver()">
                  <span>{{ isLocating ? '⏳ GPS en cours...' : '📍 Départ depuis ma position GPS' }}</span>
                </button>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Ville ou point de départ *</label>
                  <input class="form-control" formControlName="origin" placeholder="Ex: Ariana (Technopôle)">
                </div>

                <div class="form-group">
                  <label>Ville ou point d'arrivée *</label>
                  <input class="form-control" formControlName="destination" placeholder="Ex: Les Berges du Lac 2">
                </div>
              </div>

              <div class="quick-hubs">
                <span class="hub-label">Destinations fréquentes :</span>
                <div class="hub-tags">
                  <span class="hub-tag" (click)="setDest('Les Berges du Lac 2', 36.8392, 10.2372)">Lac 2</span>
                  <span class="hub-tag" (click)="setDest('Centre Ville Tunis', 36.8008, 10.1800)">Centre Ville</span>
                  <span class="hub-tag" (click)="setDest('Technopôle El Ghazala', 36.8970, 10.1895)">Ghazala</span>
                  <span class="hub-tag" (click)="setDest('Sousse Centre', 35.8256, 10.6084)">Sousse</span>
                  <span class="hub-tag" (click)="setDest('Sfax', 34.7406, 10.7603)">Sfax</span>
                </div>
              </div>

              <!-- Live Interactive Map on Step 1 -->
              <div class="map-box mt-2">
                <app-map-view
                  [originLat]="originCoords.lat"
                  [originLng]="originCoords.lng"
                  [originLabel]="form.value.origin || 'Départ'"
                  [destLat]="destCoords.lat"
                  [destLng]="destCoords.lng"
                  [destLabel]="form.value.destination || 'Arrivée'"
                  (locationSelected)="onMapPicked($event)"
                ></app-map-view>
              </div>
            </div>

            <!-- STEP 2: Détails, Places & Prix -->
            <div *ngIf="step === 2" class="step-content">
              <h2>🕐 2. Horaires, Places & Tarification</h2>

              <div class="form-grid">
                <div class="form-group">
                  <label>Date du trajet *</label>
                  <input type="date" class="form-control" formControlName="date">
                </div>

                <div class="form-group">
                  <label>Heure de départ *</label>
                  <input type="time" class="form-control" formControlName="time">
                </div>

                <div class="form-group">
                  <label>Nombre de places proposées *</label>
                  <select class="form-control" formControlName="seats">
                    <option value="1">1 place</option>
                    <option value="2">2 places</option>
                    <option value="3">3 places</option>
                    <option value="4">4 places</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Prix par place (TND) *</label>
                  <div class="price-input-box">
                    <input type="number" step="0.5" class="form-control" formControlName="price" placeholder="7.5">
                    <span class="price-suffix">TND</span>
                  </div>
                  <small class="text-muted" *ngIf="suggestedPrice > 0">
                    💡 Tarif IA conseillé : <strong>{{ suggestedPrice }} TND</strong>
                  </small>
                </div>
              </div>

              <div class="form-group mt-2">
                <label>Informations complémentaires pour les passagers</label>
                <textarea class="form-control" rows="3" formControlName="description" placeholder="Véhicule climatisé, non-fumeur, grand coffre disponible..."></textarea>
              </div>

              <div class="preferences-toggles mt-2">
                <label class="toggle-item"><input type="checkbox" formControlName="nonSmoker"> 🚭 Non fumeur</label>
                <label class="toggle-item"><input type="checkbox" formControlName="music"> 🎵 Musique sympa</label>
                <label class="toggle-item"><input type="checkbox" formControlName="recurring"> 🔄 Trajet régulier (Lundi au Vendredi)</label>
              </div>
            </div>

            <!-- STEP 3: Récapitulatif & Publication -->
            <div *ngIf="step === 3" class="step-content">
              <h2>✅ 3. Confirmation de Publication</h2>

              <div class="summary-card">
                <div class="summary-route">
                  <span class="dot-s"></span>
                  <strong>{{ form.value.origin }}</strong>
                  <span class="arrow">➔</span>
                  <span class="dot-e"></span>
                  <strong>{{ form.value.destination }}</strong>
                </div>

                <div class="summary-metrics">
                  <div class="s-metric"><span>📅 Date</span><strong>{{ form.value.date }}</strong></div>
                  <div class="s-metric"><span>🕐 Heure</span><strong>{{ form.value.time }}</strong></div>
                  <div class="s-metric"><span>💺 Places</span><strong>{{ form.value.seats }} disponibles</strong></div>
                  <div class="s-metric"><span>💰 Tarif</span><strong class="text-accent">{{ form.value.price }} TND / place</strong></div>
                  <div class="s-metric"><span>📏 Distance</span><strong>{{ calculatedDistance }} km</strong></div>
                </div>

                <div class="active-notice mt-2">
                  <span class="active-icon">🚀</span>
                  <div>
                    <strong>Publication Immédiate & Visibilité Directe</strong>
                    <p>Votre trajet sera <strong>visible immédiatement</strong> pour tous les passagers dans l'outil de recherche. Vous pourrez le gérer ou le suspendre à tout moment dans "Mes Trajets".</p>
                  </div>
                </div>

                <div class="ia-indexing-box mt-2">
                  <span class="ia-icon">🤖</span>
                  <div>
                    <strong>Matching IA Automatique Activé</strong>
                    <p>Votre trajet est automatiquement indexé pour matcher les passagers sur votre itinéraire avec un détour minimal.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions mt-3">
              <button type="button" class="btn btn-outline" (click)="prevStep()" *ngIf="step > 1">
                ← Précédent
              </button>
              <div class="spacer"></div>
              <button type="button" class="btn btn-primary" (click)="nextStep()" *ngIf="step < 3">
                Suivant →
              </button>
              <button type="button" class="btn btn-success btn-lg" *ngIf="step === 3" (click)="publishTrip()">
                🚀 Publier le Trajet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .publish-page { max-width: 900px; margin: 0 auto; padding: 24px; }
    .publish-header { text-align: center; margin-bottom: 24px; }
    .publish-header h1 { font-size: 1.6rem; color: var(--primary); font-weight: 800; }
    .sub { color: var(--gray-500); font-size: 0.9rem; margin-top: 4px; }

    .progress-bar { display: flex; justify-content: center; gap: 48px; margin-bottom: 28px; }
    .progress-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle {
      width: 38px; height: 38px; border-radius: 50%; border: 3px solid var(--gray-200);
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      color: var(--gray-400); transition: var(--transition); background: var(--white);
    }
    .progress-step.active .step-circle { border-color: var(--accent); color: var(--accent); }
    .progress-step.done .step-circle { border-color: var(--success); background: var(--success); color: white; }
    .progress-step span { font-size: 0.8rem; color: var(--gray-500); }
    .progress-step.active span { color: var(--accent); font-weight: 700; }

    .form-card { padding: 28px; }
    .step-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .step-title-row h2 { font-size: 1.2rem; color: var(--primary); margin: 0; }
    .geo-shortcut-btn { font-size: 0.8rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .quick-hubs { margin: 12px 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .hub-label { font-size: 0.78rem; color: var(--gray-500); font-weight: 600; }
    .hub-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .hub-tag {
      font-size: 0.75rem; background: var(--gray-100); padding: 3px 10px;
      border-radius: 12px; cursor: pointer; transition: var(--transition); font-weight: 600;
    }
    .hub-tag:hover { background: var(--accent); color: white; }

    .price-input-box { position: relative; display: flex; align-items: center; }
    .price-suffix { position: absolute; right: 12px; color: var(--gray-500); font-weight: 700; font-size: 0.85rem; }

    .preferences-toggles { display: flex; gap: 20px; flex-wrap: wrap; }
    .toggle-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }

    .summary-card { background: var(--gray-50); padding: 20px; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); }
    .summary-route { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; margin-bottom: 16px; }
    .dot-s { width: 10px; height: 10px; border-radius: 50%; background: var(--success); }
    .dot-e { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); }
    .arrow { color: var(--accent); }

    .summary-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .s-metric span { display: block; font-size: 0.75rem; color: var(--gray-500); }
    .s-metric strong { font-size: 0.95rem; color: var(--gray-800); }

    .ia-indexing-box {
      display: flex; align-items: center; gap: 12px; padding: 12px;
      background: rgba(14,133,163,0.08); border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
    }
    .ia-icon { font-size: 1.8rem; }
    .ia-indexing-box strong { font-size: 0.88rem; color: var(--secondary); display: block; }
    .ia-indexing-box p { font-size: 0.78rem; margin: 2px 0 0; color: var(--gray-600); }

    .active-notice {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px;
      background: rgba(40,167,69,0.1); border-radius: var(--radius-sm); border-left: 3px solid #28a745;
    }
    .active-icon { font-size: 1.8rem; }
    .active-notice strong { font-size: 0.88rem; color: #155724; display: block; }
    .active-notice p { font-size: 0.78rem; margin: 4px 0 0; color: #155724; line-height: 1.6; }

    .blocked-access-card {
      text-align: center; padding: 48px 24px; max-width: 600px; margin: 0 auto;
      border: 2px solid #ef4444; background: var(--white);
    }
    .blocked-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .blocked-access-card h2 { color: #b91c1c; font-size: 1.4rem; margin-bottom: 12px; }
    .blocked-access-card p { color: var(--gray-600); line-height: 1.6; margin-bottom: 24px; font-size: 0.95rem; }
    .blocked-actions-box { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    .form-actions { display: flex; align-items: center; gap: 12px; }
    .spacer { flex: 1; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .summary-metrics { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class PublishTripComponent implements OnInit {
  step = 1;
  stepLabels = ['Itinéraire & GPS', 'Horaires & Tarifs', 'Confirmation'];
  form: FormGroup;
  isLocating = false;
  currentUser: any = null;

  originCoords = { lat: 36.8970, lng: 10.1895 };
  destCoords = { lat: 36.8392, lng: 10.2372 };
  calculatedDistance = 12.4;
  suggestedPrice = 7.5;

  constructor(
    private fb: FormBuilder,
    private geoService: GeolocationService,
    private tripStore: TripStoreService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      origin: ['Ariana (Technopôle El Ghazala)', Validators.required],
      destination: ['Les Berges du Lac 2', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['08:15', Validators.required],
      seats: ['3', Validators.required],
      price: [7.5, Validators.required],
      description: ['Voiture climatisée, trajet quotidien direct.'],
      nonSmoker: [true],
      music: [true],
      recurring: [true]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
    });
    this.updateRouteMetrics();
  }

  becomeDriver(): void {
    this.authService.switchRole('CONDUCTEUR');
    alert('🎉 Félicitations ! Votre profil est maintenant en Mode Conducteur. Vous pouvez publier votre annonce.');
  }

  locateCurrentDriver(): void {
    this.isLocating = true;
    this.geoService.requestLiveLocation().then(loc => {
      this.isLocating = false;
      this.form.patchValue({ origin: loc.cityName });
      this.originCoords = { lat: loc.lat, lng: loc.lng };
      this.updateRouteMetrics();
    }).catch(() => {
      this.isLocating = false;
    });
  }

  setDest(name: string, lat: number, lng: number): void {
    this.form.patchValue({ destination: name });
    this.destCoords = { lat, lng };
    this.updateRouteMetrics();
  }

  onMapPicked(event: { type: 'origin' | 'dest', lat: number, lng: number, name: string }): void {
    if (event.type === 'origin') {
      this.form.patchValue({ origin: event.name });
      this.originCoords = { lat: event.lat, lng: event.lng };
    } else {
      this.form.patchValue({ destination: event.name });
      this.destCoords = { lat: event.lat, lng: event.lng };
    }
    this.updateRouteMetrics();
  }

  private updateRouteMetrics(): void {
    this.calculatedDistance = this.geoService.calculateDistance(
      this.originCoords.lat, this.originCoords.lng,
      this.destCoords.lat, this.destCoords.lng
    );
    // Fair pricing formula: ~0.55 TND per km per seat
    this.suggestedPrice = Math.max(3.0, Math.round(this.calculatedDistance * 0.55 * 2) / 2);
    if (!this.form.value.price || this.form.value.price === 7.5) {
      this.form.patchValue({ price: this.suggestedPrice });
    }
  }

  nextStep(): void {
    if (this.step < 3) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  publishTrip(): void {
    const user = this.authService.getCurrentUser();
    const f = this.form.value;

    const newTrip = this.tripStore.createTrip({
      driverId: user?.id || 2,
      driverName: user ? `${user.firstName} ${user.lastName}` : 'Sami Mansouri',
      driverInitials: user?.avatar || (user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'SM'),
      driverRating: user?.rating || 4.9,
      driverTripsCount: user?.tripsCount || 1,
      origin: f.origin,
      destination: f.destination,
      originLat: this.originCoords.lat,
      originLng: this.originCoords.lng,
      destLat: this.destCoords.lat,
      destLng: this.destCoords.lng,
      date: f.date,
      time: f.time,
      seats: parseInt(f.seats, 10),
      price: f.price,
      distance: this.calculatedDistance,
      duration: this.geoService.estimateDuration(this.calculatedDistance),
      description: f.description || '',
      nonSmoker: f.nonSmoker,
      music: f.music,
      recurring: f.recurring,
      verified: true
    });

    alert(
      `🎉 Trajet publié avec succès !\n\n` +
      `📍 ${f.origin} ➔ ${f.destination}\n` +
      `💰 ${f.price} TND / place (${f.seats} places)\n` +
      `📏 ${this.calculatedDistance} km\n\n` +
      `✅ Ce trajet est immédiatement visible pour les passagers dans l'espace Recherche !`
    );
    this.router.navigate(['/user/my-trips']);
  }
}
