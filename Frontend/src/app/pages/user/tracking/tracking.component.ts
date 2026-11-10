import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TripStoreService, StoredTrip, StoredBooking } from '../../../core/services/trip-store.service';
import { GeolocationService, UserCurrentLocation } from '../../../core/services/geolocation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

declare const L: any;

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="tracking-page animate-fade">
      <!-- Top Navigation & Header -->
      <div class="tracking-header">
        <a routerLink="/user/bookings" class="back-link">← Retour à mes réservations</a>
        <div class="header-content">
          <div>
            <h1>📍 Suivi en Temps Réel du Conducteur</h1>
            <p *ngIf="trip" class="sub-route">
              {{ trip.origin }} ➔ {{ trip.destination }} · Avec <strong>{{ trip.driverName }}</strong>
            </p>
          </div>
          <div class="live-pill" [class.active]="isDriverMoving">
            <span class="live-dot"></span>
            <span>{{ isDriverMoving ? 'GPS EN DIRECT (Déplacement actif)' : 'GPS CONNECTÉ (Prêt pour ramassage)' }}</span>
          </div>
        </div>
      </div>

      <!-- Live Waiting & Distance Status Banner -->
      <div class="status-banner" [ngClass]="getBannerThemeClass()">
        <div class="banner-icon">{{ getStatusEmoji() }}</div>
        <div class="banner-text">
          <strong>{{ getStatusHeadline() }}</strong>
          <span>{{ getStatusSubtext() }}</span>
        </div>
        <div class="banner-metrics" *ngIf="trip">
          <div class="bm-item">
            <span class="bm-label">Distance conducteur</span>
            <strong class="bm-val">{{ distanceToPassenger }} km</strong>
          </div>
          <div class="bm-item">
            <span class="bm-label">Temps estimé (ETA)</span>
            <strong class="bm-val text-accent">{{ estimatedTimeToPassenger }}</strong>
          </div>
        </div>
      </div>

      <!-- Main Tracking Layout -->
      <div class="tracking-grid">
        <!-- Map Container -->
        <div class="map-card card">
          <div class="map-top-bar">
            <div class="map-legend">
              <span class="legend-badge driver"><span class="badge-dot"></span> 🚗 Conducteur</span>
              <span class="legend-badge passenger"><span class="badge-dot"></span> 👤 Vous (Ramassage)</span>
              <span class="legend-badge dest"><span class="badge-dot"></span> 🏁 Destination</span>
            </div>
            <div class="map-actions">
              <button type="button" class="btn btn-sm btn-outline" (click)="locatePassenger()" [disabled]="locatingPassenger">
                <span>{{ locatingPassenger ? '⏳ GPS...' : '📍 Mon GPS' }}</span>
              </button>
              <button type="button" class="btn btn-sm btn-primary sim-btn" (click)="toggleSimulation()">
                <span>{{ isSimulating ? '⏸️ Pause' : '🚗 Simuler trajet en direct' }}</span>
              </button>
            </div>
          </div>

          <!-- Leaflet Interactive Map -->
          <div #trackingMap class="tracking-map-box"></div>

          <!-- Live Real Address Feedback Bar -->
          <div class="address-bar">
            <div class="addr-item">
              <span class="addr-label">🚗 Position actuelle exacte du conducteur :</span>
              <strong class="addr-value">{{ driverRealAddress || 'Calcul de l\'adresse en cours (OpenStreetMap)...' }}</strong>
            </div>
            <div class="addr-item" *ngIf="passengerRealAddress">
              <span class="addr-label">👤 Votre point de rencontre :</span>
              <strong class="addr-value">{{ passengerRealAddress }}</strong>
            </div>
          </div>
        </div>

        <!-- Right Side Panel: Driver Info & Actions -->
        <div class="sidebar-col">
          <!-- Driver Profile Card -->
          <div class="card driver-card">
            <div class="driver-header">
              <div class="driver-avatar">{{ trip?.driverInitials || 'SM' }}</div>
              <div class="driver-info">
                <h3>{{ trip?.driverName || 'Sami Mansouri' }}</h3>
                <div class="driver-tags">
                  <span class="tag-badge verified">✅ Identité vérifiée</span>
                  <span class="tag-badge rating">⭐ {{ trip?.driverRating || 4.9 }}</span>
                </div>
              </div>
            </div>

            <div class="driver-car-box">
              <div class="car-item"><span>Véhicule :</span><strong>Clio 4 (Blanche)</strong></div>
              <div class="car-item"><span>Immatriculation :</span><strong>214 TN 5421</strong></div>
              <div class="car-item"><span>Trajets réussis :</span><strong>{{ trip?.driverTripsCount || 145 }}</strong></div>
            </div>

            <div class="driver-actions-row">
              <button class="btn btn-success btn-call" (click)="callDriver()">
                📞 Appeler (+216 98 450 120)
              </button>
              <button class="btn btn-outline btn-msg" (click)="sendDriverMessage()">
                💬 Message
              </button>
            </div>
          </div>

          <!-- Trip Overview Card -->
          <div class="card trip-summary-card">
            <h4>Détails de la course</h4>
            <div class="sum-row">
              <span class="sum-label">Départ</span>
              <strong class="sum-val">{{ trip?.origin }}</strong>
            </div>
            <div class="sum-row">
              <span class="sum-label">Destination</span>
              <strong class="sum-val">{{ trip?.destination }}</strong>
            </div>
            <div class="sum-row">
              <span class="sum-label">Horaire prévu</span>
              <strong class="sum-val">{{ trip?.time }} ({{ trip?.date }})</strong>
            </div>
            <div class="sum-row">
              <span class="sum-label">Tarif</span>
              <strong class="sum-val text-accent">{{ trip?.price }} TND</strong>
            </div>
            <div class="sum-row">
              <span class="sum-label">Statut</span>
              <span class="badge" [ngClass]="getBookingBadgeClass()">{{ booking?.status || 'CONFIRMEE' }}</span>
            </div>
          </div>

          <!-- Simulation Info Card -->
          <div class="card tip-card">
            <div class="tip-header">
              <span>💡</span><strong>Test en direct</strong>
            </div>
            <p>
              Cliquez sur <strong>"Simuler trajet en direct"</strong> pour voir le véhicule du conducteur avancer le long de la route en temps réel avec mise à jour automatique de la distance, des minutes et des rues !
            </p>
          </div>
        </div>
      </div>

      <!-- CHAT MODAL IN TRACKING -->
      <div class="modal-backdrop" *ngIf="showChatModal" (click)="closeChatModal()">
        <div class="modal-card chat-modal-card" (click)="$event.stopPropagation()">
          <div class="chat-modal-header">
            <div class="driver-chat-meta">
              <div class="avatar avatar-sm">{{ trip?.driverInitials || 'SM' }}</div>
              <div>
                <strong>{{ trip?.driverName || 'Sami Mansouri' }}</strong>
                <span class="online-indicator"><span class="green-dot"></span> En ligne (Clio 4 Blanche)</span>
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="call-action-btn" (click)="callDriver()" title="Appeler le conducteur">
                📞 Appeler
              </button>
              <button type="button" class="close-btn" (click)="closeChatModal()">✕</button>
            </div>
          </div>

          <div class="chat-thread">
            <div
              class="chat-bubble-row"
              *ngFor="let m of chatMessages"
              [class.sent]="m.senderRole === 'PASSAGER'"
              [class.received]="m.senderRole === 'CONDUCTEUR'"
            >
              <div class="chat-bubble">
                <span class="sender-name">{{ m.senderName }}</span>
                <p class="bubble-text">{{ m.text }}</p>
                <span class="bubble-time">{{ m.time }}</span>
              </div>
            </div>

            <div class="chat-typing-indicator" *ngIf="isDriverTyping">
              <span>🚗 Le conducteur est en train d'écrire...</span>
            </div>
          </div>

          <div class="quick-replies-bar">
            <button type="button" class="q-chip" (click)="sendQuickReply('Salem, je suis au point de rendez-vous !')">
              📍 Je suis là !
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('3aslema, win wsolt b-dhabet ?')">
              🚗 Win wsolt ?
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('Je serai la dans 2 minutes chrono !')">
              ⏱️ J'arrive dans 2 min
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('Pouvez-vous klaxonner en arrivant svp ?')">
              📢 Klaxonner à l'arrivée
            </button>
          </div>

          <div class="chat-input-bar">
            <input
              type="text"
              class="form-control chat-input"
              placeholder="Écrivez un message en français ou derja..."
              [(ngModel)]="newChatMessage"
              (keyup.enter)="sendMessage()"
            >
            <button type="button" class="btn btn-primary send-btn" (click)="sendMessage()" [disabled]="!newChatMessage.trim()">
              Envoyer 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-page { max-width: 1200px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }

    .tracking-header { display: flex; flex-direction: column; gap: 8px; }
    .back-link { font-size: 0.85rem; color: var(--accent); text-decoration: none; font-weight: 600; width: fit-content; }
    .back-link:hover { text-decoration: underline; }

    .header-content { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
    .header-content h1 { font-size: 1.6rem; color: var(--primary); font-weight: 800; margin: 0; }
    .sub-route { color: var(--gray-600); font-size: 0.95rem; margin: 4px 0 0; }

    .live-pill {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px;
      border-radius: 20px; font-size: 0.78rem; font-weight: 700;
      background: rgba(40,167,69,0.1); color: #28a745; border: 1px solid rgba(40,167,69,0.3);
    }
    .live-pill.active {
      background: rgba(14,133,163,0.12); color: var(--accent); border-color: var(--accent);
    }
    .live-dot {
      width: 10px; height: 10px; border-radius: 50%; background: currentColor;
      animation: pulse-dot 1.5s infinite;
    }
    @keyframes pulse-dot {
      0% { box-shadow: 0 0 0 0 rgba(40,167,69,0.6); }
      70% { box-shadow: 0 0 0 8px rgba(40,167,69,0); }
      100% { box-shadow: 0 0 0 0 rgba(40,167,69,0); }
    }

    .status-banner {
      display: flex; align-items: center; gap: 16px; padding: 16px 20px;
      border-radius: var(--radius); flex-wrap: wrap;
    }
    .status-banner.theme-waiting {
      background: linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05));
      border: 1px solid rgba(255,193,7,0.4);
    }
    .status-banner.theme-moving {
      background: linear-gradient(135deg, rgba(14,133,163,0.12), rgba(14,133,163,0.04));
      border: 1px solid rgba(14,133,163,0.3);
    }
    .status-banner.theme-arrived {
      background: linear-gradient(135deg, rgba(40,167,69,0.15), rgba(40,167,69,0.05));
      border: 1px solid rgba(40,167,69,0.4);
    }

    .banner-icon { font-size: 2.2rem; }
    .banner-text { flex: 1; min-width: 240px; }
    .banner-text strong { display: block; font-size: 1.05rem; color: var(--gray-800); }
    .banner-text span { font-size: 0.85rem; color: var(--gray-600); }

    .banner-metrics { display: flex; gap: 20px; align-items: center; }
    .bm-item { display: flex; flex-direction: column; align-items: flex-end; }
    .bm-label { font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; }
    .bm-val { font-size: 1.15rem; font-weight: 800; color: var(--primary); }

    .tracking-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: flex-start; }

    .map-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .map-top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .map-legend { display: flex; gap: 10px; flex-wrap: wrap; }
    .legend-badge {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem;
      padding: 4px 10px; border-radius: 12px; background: var(--gray-100); font-weight: 600;
    }
    .badge-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-badge.driver .badge-dot { background: #0e85a3; }
    .legend-badge.passenger .badge-dot { background: #22c55e; }
    .legend-badge.dest .badge-dot { background: #ef4444; }

    .map-actions { display: flex; gap: 8px; }
    .sim-btn { font-weight: 700; }

    .tracking-map-box {
      height: 480px; width: 100%; border-radius: var(--radius-sm);
      border: 2px solid var(--accent-light); z-index: 10;
    }

    .address-bar {
      display: flex; flex-direction: column; gap: 8px; padding: 12px 14px;
      background: var(--gray-50); border-radius: var(--radius-sm); border: 1px solid var(--gray-200);
    }
    .addr-item { display: flex; flex-direction: column; gap: 2px; }
    .addr-label { font-size: 0.72rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700; }
    .addr-value { font-size: 0.88rem; color: var(--secondary); font-weight: 600; }

    .sidebar-col { display: flex; flex-direction: column; gap: 16px; }

    .driver-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .driver-header { display: flex; align-items: center; gap: 14px; }
    .driver-avatar {
      width: 54px; height: 54px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.1rem; flex-shrink: 0;
    }
    .driver-info h3 { font-size: 1.1rem; color: var(--primary); margin: 0 0 4px; }
    .driver-tags { display: flex; gap: 6px; }
    .tag-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .tag-badge.verified { background: rgba(40,167,69,0.1); color: #28a745; }
    .tag-badge.rating { background: rgba(255,193,7,0.15); color: #856404; }

    .driver-car-box {
      background: var(--gray-50); padding: 12px; border-radius: var(--radius-sm);
      display: flex; flex-direction: column; gap: 6px; border: 1px solid var(--gray-200);
    }
    .car-item { display: flex; justify-content: space-between; font-size: 0.8rem; }
    .car-item span { color: var(--gray-500); }
    .car-item strong { color: var(--gray-800); }

    .driver-actions-row { display: flex; gap: 8px; }
    .btn-call { flex: 2; font-weight: 700; font-size: 0.82rem; }
    .btn-msg { flex: 1; font-size: 0.82rem; }

    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px; animation: fadeIn 0.2s ease;
    }
    .chat-modal-card {
      background: var(--white); border-radius: var(--radius-lg); width: 100%;
      max-width: 580px; height: 560px; box-shadow: var(--shadow-lg); overflow: hidden;
      display: flex; flex-direction: column;
    }
    .chat-modal-header {
      padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--gray-200); background: var(--white);
    }
    .driver-chat-meta { display: flex; align-items: center; gap: 10px; }
    .driver-chat-meta strong { display: block; font-size: 0.95rem; }
    .online-indicator { font-size: 0.72rem; color: #16a34a; display: flex; align-items: center; gap: 4px; }
    .green-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }
    .chat-header-actions { display: flex; align-items: center; gap: 8px; }
    .call-action-btn {
      background: #16a34a; color: white; border: none; padding: 5px 10px; border-radius: 14px;
      font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: var(--transition);
    }
    .call-action-btn:hover { background: #15803d; }
    .close-btn { background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--gray-500); }

    .chat-thread {
      flex: 1; padding: 16px; overflow-y: auto; background: #f8fafc;
      display: flex; flex-direction: column; gap: 12px;
    }
    .chat-bubble-row { display: flex; width: 100%; }
    .chat-bubble-row.sent { justify-content: flex-end; }
    .chat-bubble-row.received { justify-content: flex-start; }

    .chat-bubble {
      max-width: 75%; padding: 10px 14px; border-radius: 14px; display: flex;
      flex-direction: column; gap: 2px; box-shadow: var(--shadow-sm);
    }
    .chat-bubble-row.sent .chat-bubble {
      background: var(--accent); color: white; border-bottom-right-radius: 2px;
    }
    .chat-bubble-row.received .chat-bubble {
      background: var(--white); color: var(--gray-800); border-bottom-left-radius: 2px;
      border: 1px solid var(--gray-200);
    }
    .sender-name { font-size: 0.68rem; font-weight: 700; opacity: 0.8; }
    .bubble-text { font-size: 0.88rem; margin: 0; line-height: 1.4; }
    .bubble-time { font-size: 0.65rem; opacity: 0.75; text-align: right; }

    .chat-typing-indicator { font-size: 0.75rem; color: var(--gray-500); font-style: italic; }

    .quick-replies-bar {
      display: flex; gap: 6px; padding: 8px 12px; background: var(--white);
      overflow-x: auto; border-top: 1px solid var(--gray-100);
    }
    .q-chip {
      background: var(--gray-100); border: 1px solid var(--gray-200); padding: 4px 10px;
      border-radius: 14px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;
      transition: var(--transition);
    }
    .q-chip:hover { background: var(--accent); color: white; border-color: var(--accent); }

    .chat-input-bar {
      display: flex; gap: 8px; padding: 12px; background: var(--white);
      border-top: 1px solid var(--gray-200);
    }
    .chat-input { flex: 1; font-size: 0.88rem; }
    .send-btn { font-weight: 700; white-space: nowrap; }

    .trip-summary-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .trip-summary-card h4 { margin: 0 0 6px; color: var(--primary); font-size: 0.95rem; }
    .sum-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding: 4px 0; border-bottom: 1px solid var(--gray-100); }
    .sum-row:last-child { border-bottom: none; }
    .sum-label { color: var(--gray-500); }
    .sum-val { color: var(--gray-800); }

    .tip-card {
      padding: 16px; background: rgba(14,133,163,0.06); border-radius: var(--radius-sm);
      border-left: 3px solid var(--accent);
    }
    .tip-header { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--secondary); margin-bottom: 6px; }
    .tip-card p { font-size: 0.78rem; color: var(--gray-600); margin: 0; line-height: 1.5; }

    @media (max-width: 960px) {
      .tracking-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('trackingMap', { static: false }) mapContainer!: ElementRef;

  booking: StoredBooking | null = null;
  trip: StoredTrip | null = null;

  // Real-time GPS & Geocoding values
  driverCurrentLat = 36.8970;
  driverCurrentLng = 10.1895;
  passengerLat = 36.8970;
  passengerLng = 10.1895;
  destLat = 36.8392;
  destLng = 10.2372;

  driverRealAddress = '';
  passengerRealAddress = '';
  distanceToPassenger = '0.0';
  estimatedTimeToPassenger = '0 min';

  isDriverMoving = false;
  isSimulating = false;
  locatingPassenger = false;

  private map: any;
  private driverMarker: any;
  private passengerMarker: any;
  private destMarker: any;
  private routeLine: any;
  private simInterval: any;
  private pollInterval: any;
  private simProgress = 0;

  // Chat State
  showChatModal = false;
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isDriverTyping = false;
  private chatSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripStore: TripStoreService,
    private geoService: GeolocationService,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.chatSub = this.chatService.messages$.subscribe(all => {
      const bId = this.booking?.id || 50;
      this.chatMessages = all[bId] || [];
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initLeafletMap();
    }, 250);
  }

  ngOnDestroy(): void {
    if (this.simInterval) clearInterval(this.simInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.chatSub) this.chatSub.unsubscribe();
  }

  private loadData(): void {
    const rawId = Number(this.route.snapshot.paramMap.get('bookingId')) || 0;
    const user = this.authService.getCurrentUser();

    // 1. Check if rawId matches a booking
    let foundBooking = this.tripStore.getBookingById(rawId);

    // 2. Or check if rawId matches a trip
    if (!foundBooking) {
      const foundTrip = this.tripStore.getTripById(rawId);
      if (foundTrip) {
        this.trip = foundTrip;
        // Check if there is an existing booking for this user on this trip
        if (user) {
          const userBookings = this.tripStore.getPassengerBookings(user.id);
          foundBooking = userBookings.find(b => b.tripId === foundTrip.id);
        }
      }
    } else {
      this.booking = foundBooking;
      this.trip = this.tripStore.getTripById(foundBooking.tripId) || null;
    }

    // 3. Fallback: if not found, load the first active trip
    if (!this.trip) {
      const activeTrips = this.tripStore.getActiveTrips();
      this.trip = activeTrips[0] || this.tripStore.getAllTrips()[0];
    }

    if (this.trip) {
      this.driverCurrentLat = this.trip.originLat;
      this.driverCurrentLng = this.trip.originLng;
      this.passengerLat = this.trip.originLat;
      this.passengerLng = this.trip.originLng;
      this.destLat = this.trip.destLat;
      this.destLng = this.trip.destLng;
      this.passengerRealAddress = this.trip.origin;
    }

    // Update real address via OSM Nominatim
    this.updateAddressText();
  }

  private initLeafletMap(): void {
    if (!this.mapContainer || typeof L === 'undefined' || !this.trip) return;

    this.map = L.map(this.mapContainer.nativeElement).setView([this.driverCurrentLat, this.driverCurrentLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | SmartRide Live GPS'
    }).addTo(this.map);

    // 1. Destination Marker (Red Flag)
    const destIcon = L.divIcon({
      className: 'live-dest-icon',
      html: '<div style="background:#ef4444;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);text-align:center;color:white;font-size:16px;line-height:26px;">🏁</div>',
      iconSize: [32, 32], iconAnchor: [16, 32]
    });
    this.destMarker = L.marker([this.destLat, this.destLng], { icon: destIcon })
      .addTo(this.map)
      .bindPopup(`<strong>🏁 Destination finale</strong><br>${this.trip.destination}`);

    // 2. Passenger Pickup Marker (Green Pin)
    const passIcon = L.divIcon({
      className: 'live-pass-icon',
      html: '<div style="background:#22c55e;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.35);text-align:center;color:white;font-size:15px;line-height:24px;">👤</div>',
      iconSize: [30, 30], iconAnchor: [15, 30]
    });
    this.passengerMarker = L.marker([this.passengerLat, this.passengerLng], { icon: passIcon })
      .addTo(this.map)
      .bindPopup(`<strong>👤 Point de ramassage du passager</strong><br>${this.trip.origin}`);

    // 3. Driver Live Car Marker (Blue Car with pulse)
    const carIcon = L.divIcon({
      className: 'live-car-icon',
      html: '<div style="background:#0e85a3;width:38px;height:38px;border-radius:50%;border:3px solid white;box-shadow:0 4px 14px rgba(14,133,163,0.6);text-align:center;color:white;font-size:18px;line-height:32px;cursor:pointer;">🚗</div>',
      iconSize: [38, 38], iconAnchor: [19, 38]
    });
    this.driverMarker = L.marker([this.driverCurrentLat, this.driverCurrentLng], { icon: carIcon })
      .addTo(this.map)
      .bindPopup(`<strong>🚗 Conducteur : ${this.trip.driverName}</strong><br>En attente du passager`)
      .openPopup();

    // 4. Polyline Route
    this.routeLine = L.polyline([
      [this.driverCurrentLat, this.driverCurrentLng],
      [this.destLat, this.destLng]
    ], {
      color: '#0e85a3', weight: 5, opacity: 0.8, dashArray: '6, 8'
    }).addTo(this.map);

    try {
      const bounds = L.latLngBounds([
        [this.driverCurrentLat, this.driverCurrentLng],
        [this.destLat, this.destLng]
      ]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {}

    this.recalculateMetrics();
  }

  // ─── Simulation & Live Movement ─────────────────────────

  toggleSimulation(): void {
    if (this.isSimulating) {
      this.pauseSimulation();
    } else {
      this.startSimulation();
    }
  }

  private startSimulation(): void {
    if (!this.trip) return;
    this.isSimulating = true;
    this.isDriverMoving = true;

    // Simulate car moving along route in 20 steps
    this.simInterval = setInterval(async () => {
      this.simProgress += 0.05;

      if (this.simProgress >= 1) {
        this.simProgress = 1;
        this.pauseSimulation();
        alert('🏁 Le conducteur est arrivé à destination !');
      }

      // Linear interpolation between origin and destination
      const lat = this.trip!.originLat + (this.trip!.destLat - this.trip!.originLat) * this.simProgress;
      const lng = this.trip!.originLng + (this.trip!.destLng - this.trip!.originLng) * this.simProgress;

      this.driverCurrentLat = lat;
      this.driverCurrentLng = lng;

      // Move car marker
      if (this.driverMarker) {
        this.driverMarker.setLatLng([lat, lng]);
      }

      // Update route line
      if (this.routeLine && this.map) {
        this.map.removeLayer(this.routeLine);
        this.routeLine = L.polyline([
          [lat, lng],
          [this.destLat, this.destLng]
        ], {
          color: '#0e85a3', weight: 5, opacity: 0.85, dashArray: '6, 8'
        }).addTo(this.map);
      }

      this.recalculateMetrics();

      // Reverse geocode driver's position on every 3rd step
      if (Math.round(this.simProgress * 20) % 3 === 0) {
        this.driverRealAddress = await this.geoService.reverseGeocode(lat, lng);
        if (this.driverMarker) {
          this.driverMarker.setPopupContent(`<strong>🚗 ${this.trip!.driverName}</strong><br>${this.driverRealAddress}`);
        }
      }
    }, 2000);
  }

  private pauseSimulation(): void {
    this.isSimulating = false;
    this.isDriverMoving = false;
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  // ─── Locate Passenger ───────────────────────────────────

  locatePassenger(): void {
    this.locatingPassenger = true;
    this.geoService.requestLiveLocation().then(async (loc: UserCurrentLocation) => {
      this.locatingPassenger = false;
      this.passengerLat = loc.lat;
      this.passengerLng = loc.lng;
      this.passengerRealAddress = loc.cityName;

      if (this.passengerMarker) {
        this.passengerMarker.setLatLng([loc.lat, loc.lng]);
        this.passengerMarker.setPopupContent(`<strong>👤 Votre position GPS réelle</strong><br>${loc.cityName}`).openPopup();
      }

      if (this.map) {
        this.map.setView([loc.lat, loc.lng], 14);
      }

      this.recalculateMetrics();
    }).catch(() => {
      this.locatingPassenger = false;
    });
  }

  // ─── Metrics & Calculations ─────────────────────────────

  private recalculateMetrics(): void {
    const dist = this.geoService.calculateDistance(
      this.driverCurrentLat, this.driverCurrentLng,
      this.passengerLat, this.passengerLng
    );
    this.distanceToPassenger = dist.toFixed(1);
    this.estimatedTimeToPassenger = this.geoService.estimateDuration(dist);
  }

  private async updateAddressText(): Promise<void> {
    try {
      this.driverRealAddress = await this.geoService.reverseGeocode(this.driverCurrentLat, this.driverCurrentLng);
    } catch {
      this.driverRealAddress = this.trip?.origin || 'Tunis';
    }
  }

  // ─── User Actions ───────────────────────────────────────

  callDriver(): void {
    alert(`📞 Appel en cours vers ${this.trip?.driverName || 'le conducteur'} (+216 98 450 120)...`);
  }

  sendDriverMessage(): void {
    const bId = this.booking?.id || 50;
    this.chatMessages = this.chatService.getMessages(bId);
    this.showChatModal = true;
  }

  closeChatModal(): void {
    this.showChatModal = false;
  }

  sendMessage(): void {
    if (!this.newChatMessage.trim()) return;
    const bId = this.booking?.id || 50;
    const user = this.authService.getCurrentUser() || { firstName: 'Ibtihel', lastName: 'Baccari' };
    const senderName = `${user.firstName} ${user.lastName}`;

    this.chatService.sendMessage(bId, this.newChatMessage, senderName, 'PASSAGER');
    this.newChatMessage = '';

    this.isDriverTyping = true;
    setTimeout(() => {
      this.isDriverTyping = false;
    }, 1200);
  }

  sendQuickReply(text: string): void {
    this.newChatMessage = text;
    this.sendMessage();
  }

  // ─── Status Text & Themes ───────────────────────────────

  getStatusEmoji(): string {
    if (parseFloat(this.distanceToPassenger) <= 0.2) return '🎉';
    if (this.isDriverMoving) return '🚗';
    return '⏳';
  }

  getStatusHeadline(): string {
    const dist = parseFloat(this.distanceToPassenger);
    if (dist <= 0.2) return 'Le conducteur est arrivé à votre point de ramassage !';
    if (this.isDriverMoving) return `Conducteur en route vers vous · Arrivée estimée dans ${this.estimatedTimeToPassenger}`;
    return 'Le conducteur est prêt · En attente de votre départ';
  }

  getStatusSubtext(): string {
    const dist = parseFloat(this.distanceToPassenger);
    if (dist <= 0.2) return 'Rejoignez le véhicule (Clio 4 Blanche, 214 TN 5421)';
    return `Position GPS exacte : ${this.driverRealAddress || 'Localisation active'}`;
  }

  getBannerThemeClass(): string {
    const dist = parseFloat(this.distanceToPassenger);
    if (dist <= 0.2) return 'theme-arrived';
    if (this.isDriverMoving) return 'theme-moving';
    return 'theme-waiting';
  }

  getBookingBadgeClass(): any {
    const st = this.booking?.status || 'CONFIRMEE';
    return {
      'badge-success': st === 'CONFIRMEE',
      'badge-primary': st === 'EN_COURS',
      'badge-warning': st === 'EN_ATTENTE',
      'badge-info': st === 'TERMINEE'
    };
  }
}
