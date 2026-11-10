import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeolocationService, UserCurrentLocation, GeoLocationPoint } from '../../../core/services/geolocation.service';

declare const L: any;

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-wrapper card">
      <div class="map-toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">🗺️ Carte Interactive GPS</span>
          <span class="live-indicator"><span class="pulse-dot"></span> Précision Réelle</span>
        </div>
        <div class="toolbar-actions">
          <!-- Quick Governorate Selector -->
          <select class="city-quick-select" (change)="onCitySelect($event)">
            <option value="">📍 Choisir ma ville (24 Gouvernorats)</option>
            <option *ngFor="let g of governorates" [value]="g.name">{{ g.name }}</option>
          </select>

          <button type="button" class="btn btn-sm btn-primary locate-btn" (click)="locateMe()" [disabled]="locating">
            <span>{{ locating ? '⏳ Détection GPS...' : '📍 Détecter mon GPS' }}</span>
          </button>
        </div>
      </div>

      <!-- Real Map Container -->
      <div #mapContainer class="leaflet-map-box"></div>

      <!-- Map Instructions & Feedback -->
      <div class="map-tip-bar">
        <span>💡 <strong>Astuce :</strong> Vous pouvez <strong>glisser-déplacer les marqueurs 📍</strong> ou cliquer n'importe où sur la carte pour définir votre position exacte !</span>
      </div>

      <!-- Route Info Floating Bar -->
      <div class="map-route-bar" *ngIf="distanceKm > 0">
        <div class="route-metric">
          <span class="metric-icon">📏</span>
          <div>
            <span class="m-label">Distance calculée</span>
            <strong>{{ distanceKm }} km</strong>
          </div>
        </div>
        <div class="route-metric">
          <span class="metric-icon">⏱️</span>
          <div>
            <span class="m-label">Temps estimé</span>
            <strong>{{ estimatedTime }}</strong>
          </div>
        </div>
        <div class="route-metric">
          <span class="metric-icon">⛽</span>
          <div>
            <span class="m-label">Carburant estimé</span>
            <strong class="text-accent">{{ (distanceKm * 0.22).toFixed(1) }} TND</strong>
          </div>
        </div>
      </div>

      <!-- GPS Address Feedback -->
      <div class="location-status" *ngIf="currentAddress">
        <span class="status-icon">📍</span>
        <span class="status-text">{{ currentAddress }}</span>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper { padding: 16px; display: flex; flex-direction: column; gap: 10px; position: relative; }
    .map-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .toolbar-title { font-weight: 700; font-size: 0.95rem; color: var(--primary); }
    .live-indicator {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem;
      color: var(--success); font-weight: 600; margin-left: 8px;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--success);
      box-shadow: 0 0 0 0 rgba(40,167,69,0.7); animation: pulse-ring 1.5s infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40,167,69,0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(40,167,69,0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40,167,69,0); }
    }

    .toolbar-actions { display: flex; gap: 8px; align-items: center; }
    .city-quick-select {
      padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--gray-300);
      font-size: 0.78rem; font-family: var(--font); color: var(--gray-700); background: var(--white);
    }
    .locate-btn { font-size: 0.78rem; font-weight: 600; white-space: nowrap; }

    .leaflet-map-box {
      height: 380px; width: 100%; border-radius: var(--radius-sm);
      border: 1px solid var(--gray-200); z-index: 10;
    }

    .map-tip-bar {
      font-size: 0.75rem; color: var(--gray-600); background: #f8fafc;
      padding: 8px 12px; border-radius: var(--radius-sm); border: 1px dashed var(--gray-300);
    }

    .map-route-bar {
      display: flex; justify-content: space-around; background: var(--gray-50);
      padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--gray-200);
      align-items: center;
    }
    .route-metric { display: flex; align-items: center; gap: 8px; }
    .metric-icon { font-size: 1.2rem; }
    .m-label { display: block; font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; }
    .route-metric strong { font-size: 0.9rem; color: var(--gray-800); }

    .location-status {
      display: flex; align-items: center; gap: 8px; font-size: 0.8rem;
      color: var(--secondary); background: rgba(14,133,163,0.08); padding: 8px 12px;
      border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
    }
  `]
})
export class MapViewComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  @Input() originLat = 36.8008; // Tunis centre default
  @Input() originLng = 10.1800;
  @Input() originLabel = 'Départ';

  @Input() destLat = 36.8392; // Lac 2 default
  @Input() destLng = 10.2372;
  @Input() destLabel = 'Arrivée';

  @Input() interactive = true;
  @Output() locationSelected = new EventEmitter<{ type: 'origin' | 'dest', lat: number, lng: number, name: string }>();

  governorates: GeoLocationPoint[] = [];

  private map: any;
  private originMarker: any;
  private destMarker: any;
  private routeLine: any;

  locating = false;
  distanceKm = 0;
  estimatedTime = '';
  currentAddress = '';

  constructor(private geoService: GeolocationService) {
    this.governorates = this.geoService.TUNISIAN_GOVERNORATES;
  }

  ngOnInit(): void {
    this.calculateRouteMetrics();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initLeafletMap();
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['originLat'] || changes['originLng'] || changes['destLat'] || changes['destLng'])) {
      this.updateMarkersAndRoute();
    }
  }

  private initLeafletMap(): void {
    if (!this.mapContainer || typeof L === 'undefined') return;

    this.map = L.map(this.mapContainer.nativeElement).setView([this.originLat, this.originLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | SmartRide Tunisie'
    }).addTo(this.map);

    this.updateMarkersAndRoute();

    // Map Click: place point exactly where user clicked!
    if (this.interactive) {
      this.map.on('click', async (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const realName = await this.geoService.reverseGeocode(lat, lng);

        this.destLat = lat;
        this.destLng = lng;
        this.destLabel = realName;

        this.updateMarkersAndRoute();

        this.locationSelected.emit({
          type: 'dest',
          lat,
          lng,
          name: realName
        });
      });
    }
  }

  private updateMarkersAndRoute(): void {
    if (!this.map || typeof L === 'undefined') return;

    if (this.originMarker) this.map.removeLayer(this.originMarker);
    if (this.destMarker) this.map.removeLayer(this.destMarker);
    if (this.routeLine) this.map.removeLayer(this.routeLine);

    // Green Draggable Pin for Origin
    const greenIcon = L.divIcon({
      className: 'custom-pin origin-pin',
      html: '<div style="background:#22c55e;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.35);text-align:center;color:white;font-size:14px;line-height:22px;cursor:grab;">📍</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    // Red Draggable Pin for Destination
    const redIcon = L.divIcon({
      className: 'custom-pin dest-pin',
      html: '<div style="background:#ef4444;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.35);text-align:center;color:white;font-size:14px;line-height:22px;cursor:grab;">🏁</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    // 1. Origin Marker (Draggable)
    this.originMarker = L.marker([this.originLat, this.originLng], { icon: greenIcon, draggable: true })
      .addTo(this.map)
      .bindPopup(`<strong>Point de départ (Déplaçable)</strong><br>${this.originLabel}`)
      .openPopup();

    this.originMarker.on('dragend', async (e: any) => {
      const pos = e.target.getLatLng();
      this.originLat = pos.lat;
      this.originLng = pos.lng;
      const realAddress = await this.geoService.reverseGeocode(pos.lat, pos.lng);
      this.originLabel = realAddress;
      this.currentAddress = `Départ ajusté : ${realAddress}`;
      this.originMarker.setPopupContent(`<strong>Point de départ</strong><br>${realAddress}`);
      this.calculateRouteMetrics();
      this.locationSelected.emit({ type: 'origin', lat: pos.lat, lng: pos.lng, name: realAddress });
    });

    // 2. Destination Marker (Draggable)
    this.destMarker = L.marker([this.destLat, this.destLng], { icon: redIcon, draggable: true })
      .addTo(this.map)
      .bindPopup(`<strong>Destination (Déplaçable)</strong><br>${this.destLabel}`);

    this.destMarker.on('dragend', async (e: any) => {
      const pos = e.target.getLatLng();
      this.destLat = pos.lat;
      this.destLng = pos.lng;
      const realAddress = await this.geoService.reverseGeocode(pos.lat, pos.lng);
      this.destLabel = realAddress;
      this.currentAddress = `Destination ajustée : ${realAddress}`;
      this.destMarker.setPopupContent(`<strong>Destination</strong><br>${realAddress}`);
      this.calculateRouteMetrics();
      this.locationSelected.emit({ type: 'dest', lat: pos.lat, lng: pos.lng, name: realAddress });
    });

    // Polyline Route
    this.routeLine = L.polyline([
      [this.originLat, this.originLng],
      [this.destLat, this.destLng]
    ], {
      color: '#0e85a3',
      weight: 5,
      opacity: 0.85,
      dashArray: '6, 8'
    }).addTo(this.map);

    this.calculateRouteMetrics();

    try {
      const bounds = L.latLngBounds([
        [this.originLat, this.originLng],
        [this.destLat, this.destLng]
      ]);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    } catch (e) {}
  }

  locateMe(): void {
    this.locating = true;
    this.geoService.requestLiveLocation().then(async (loc: UserCurrentLocation) => {
      this.locating = false;
      this.originLat = loc.lat;
      this.originLng = loc.lng;
      this.originLabel = loc.cityName;
      this.currentAddress = `Position détectée : ${loc.cityName} (${loc.isApproximate ? 'Approximative par IP' : 'GPS Haute Précision'})`;

      this.updateMarkersAndRoute();

      if (this.map) {
        this.map.setView([loc.lat, loc.lng], 13);
      }

      this.locationSelected.emit({
        type: 'origin',
        lat: loc.lat,
        lng: loc.lng,
        name: loc.cityName
      });
    }).catch(() => {
      this.locating = false;
    });
  }

  onCitySelect(event: any): void {
    const cityName = event.target.value;
    if (!cityName) return;
    const found = this.governorates.find(g => g.name === cityName);
    if (found) {
      this.originLat = found.lat;
      this.originLng = found.lng;
      this.originLabel = found.name;
      this.currentAddress = `Ville sélectionnée : ${found.name}`;
      this.updateMarkersAndRoute();
      if (this.map) {
        this.map.setView([found.lat, found.lng], 12);
      }
      this.locationSelected.emit({
        type: 'origin',
        lat: found.lat,
        lng: found.lng,
        name: found.name
      });
    }
  }

  private calculateRouteMetrics(): void {
    this.distanceKm = this.geoService.calculateDistance(this.originLat, this.originLng, this.destLat, this.destLng);
    this.estimatedTime = this.geoService.estimateDuration(this.distanceKm);
  }
}
