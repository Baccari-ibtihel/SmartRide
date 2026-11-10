import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminTrip {
  id: number;
  driver: string;
  driverPhone: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  status: 'ACTIF' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  iaMatchScore: number;
  bookingsCount: number;
}

@Component({
  selector: 'app-admin-trips',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-trips-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Gestion des Trajets</h2>
          <p class="text-muted">Supervisez l'ensemble des trajets publiés, vérifiez les scores d'IA et les réservations</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-val">{{ trips.length }}</span>
          <span class="m-lbl">Total Trajets</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-accent">{{ getCountByStatus('ACTIF') }}</span>
          <span class="m-lbl">Trajets Ouverts</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-success">{{ getCountByStatus('EN_COURS') }}</span>
          <span class="m-lbl">En Route</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-warning">{{ getAvgScore() }}%</span>
          <span class="m-lbl">Score IA Moyen</span>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par ville, conducteur ou ID..." 
            [(ngModel)]="searchQuery"
            class="form-control"
          />
        </div>
        <div class="select-filters">
          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminés</option>
            <option value="ANNULE">Annulés</option>
          </select>
        </div>
      </div>

      <!-- Trips Table -->
      <div class="table-container card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Conducteur</th>
              <th>Itinéraire</th>
              <th>Date & Heure</th>
              <th>Places</th>
              <th>Prix / place</th>
              <th>Score IA</th>
              <th>Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTrips">
              <td><strong>#TRP-{{ t.id }}</strong></td>
              <td>
                <div class="driver-cell">
                  <strong>{{ t.driver }}</strong>
                  <span class="text-muted">{{ t.driverPhone }}</span>
                </div>
              </td>
              <td>
                <div class="route-cell">
                  <span>📍 {{ t.origin }}</span>
                  <span class="arrow">➔</span>
                  <span>🏁 {{ t.destination }}</span>
                </div>
              </td>
              <td>
                <div class="time-cell">
                  <strong>{{ t.date }}</strong>
                  <span class="text-muted">🕐 {{ t.time }}</span>
                </div>
              </td>
              <td>
                <span class="seats-pill" [class.full]="t.availableSeats === 0">
                  {{ t.totalSeats - t.availableSeats }} / {{ t.totalSeats }}
                </span>
              </td>
              <td>
                <strong class="text-accent">{{ t.price }} TND</strong>
              </td>
              <td>
                <span class="match-score-badge" [class.high]="t.iaMatchScore >= 90">
                  ⚡ {{ t.iaMatchScore }}%
                </span>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': t.status === 'ACTIF',
                  'badge-primary': t.status === 'EN_COURS',
                  'badge-info': t.status === 'TERMINE',
                  'badge-danger': t.status === 'ANNULE'
                }">{{ t.status }}</span>
              </td>
              <td>
                <div class="actions-cell">
                  <button class="btn btn-sm btn-outline" (click)="viewTrip(t)" title="Détails">👁️</button>
                  <button 
                    *ngIf="t.status === 'ACTIF'"
                    class="btn btn-sm btn-warning" 
                    (click)="cancelTrip(t)" 
                    title="Annuler le trajet"
                  >🚫</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteTrip(t)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredTrips.length === 0">
          <p class="text-muted">Aucun trajet ne correspond aux critères sélectionnés.</p>
        </div>
      </div>

      <!-- Trip Modal -->
      <div class="modal-backdrop" *ngIf="selectedTrip" (click)="selectedTrip = null">
        <div class="modal-card card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Détails du Trajet #TRP-{{ selectedTrip.id }}</h3>
            <button class="close-btn" (click)="selectedTrip = null">✕</button>
          </div>
          <div class="modal-body">
            <div class="trip-summary-box">
              <div class="route-banner">
                <h4>{{ selectedTrip.origin }} ➔ {{ selectedTrip.destination }}</h4>
                <span class="badge badge-primary">{{ selectedTrip.status }}</span>
              </div>
              <div class="grid-2 mt-2">
                <div>
                  <span class="text-muted">Conducteur</span>
                  <p><strong>{{ selectedTrip.driver }}</strong> ({{ selectedTrip.driverPhone }})</p>
                </div>
                <div>
                  <span class="text-muted">Date et Heure</span>
                  <p><strong>{{ selectedTrip.date }} à {{ selectedTrip.time }}</strong></p>
                </div>
                <div>
                  <span class="text-muted">Tarif fixé</span>
                  <p><strong class="text-accent">{{ selectedTrip.price }} TND / passager</strong></p>
                </div>
                <div>
                  <span class="text-muted">Matching IA</span>
                  <p><strong>⚡ {{ selectedTrip.iaMatchScore }}% de compatibilité</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedTrip = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-trips-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { text-align: center; padding: 16px; }
    .m-val { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .m-lbl { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; }

    .filter-bar { display: flex; gap: 16px; align-items: center; padding: 16px; }
    .search-box { flex: 1; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .search-box input { padding-left: 38px; }

    .driver-cell { display: flex; flex-direction: column; font-size: 0.85rem; }
    .route-cell { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; }
    .arrow { color: var(--accent); }
    .time-cell { display: flex; flex-direction: column; font-size: 0.85rem; }
    
    .seats-pill {
      display: inline-block; padding: 4px 10px; border-radius: 20px;
      background: var(--gray-100); font-size: 0.8rem; font-weight: 700;
    }
    .seats-pill.full { background: rgba(220,53,69,0.15); color: var(--danger); }

    .match-score-badge {
      display: inline-flex; align-items: center; padding: 4px 8px; border-radius: var(--radius-sm);
      font-weight: 700; font-size: 0.8rem; background: rgba(14,133,163,0.1); color: var(--accent);
    }
    .match-score-badge.high { background: rgba(40,167,69,0.12); color: var(--success); }

    .actions-cell { display: flex; justify-content: center; gap: 6px; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-card { width: 100%; max-width: 550px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-100); padding-bottom: 12px; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--gray-500); }
    .trip-summary-box { background: var(--gray-50); padding: 16px; border-radius: var(--radius-sm); margin-top: 16px; }
    .route-banner { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-200); padding-bottom: 10px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-footer { display: flex; justify-content: flex-end; margin-top: 20px; }
  `]
})
export class AdminTripsComponent {
  searchQuery = '';
  statusFilter = 'ALL';
  selectedTrip: AdminTrip | null = null;

  trips: AdminTrip[] = [
    { id: 201, driver: 'Sami Mansouri', driverPhone: '+216 98 450 120', origin: 'Ariana (Borj Louzir)', destination: 'Lac 2 (Zone Franche)', date: '11 Nov 2026', time: '08:15', totalSeats: 4, availableSeats: 1, price: 8.5, status: 'ACTIF', iaMatchScore: 98, bookingsCount: 3 },
    { id: 202, driver: 'Amira Ben Salah', driverPhone: '+216 22 345 678', origin: 'Ennasr 2', destination: 'Tunis Centre (Habib Bourguiba)', date: '11 Nov 2026', time: '08:30', totalSeats: 3, availableSeats: 0, price: 6.0, status: 'ACTIF', iaMatchScore: 94, bookingsCount: 3 },
    { id: 203, driver: 'Youssef Trabelsi', driverPhone: '+216 50 112 334', origin: 'La Marsa', destination: 'Technopôle El Ghazala', date: '11 Nov 2026', time: '07:45', totalSeats: 4, availableSeats: 2, price: 7.0, status: 'EN_COURS', iaMatchScore: 91, bookingsCount: 2 },
    { id: 204, driver: 'Fatma Khelifi', driverPhone: '+216 27 654 321', origin: 'Sousse (Sahloul)', destination: 'Monastir (Faculté)', date: '12 Nov 2026', time: '09:00', totalSeats: 3, availableSeats: 1, price: 10.0, status: 'ACTIF', iaMatchScore: 89, bookingsCount: 2 },
    { id: 205, driver: 'Karim Gharbi', driverPhone: '+216 93 887 766', origin: 'Sfax Centre', destination: 'Tunis (Place Barcelone)', date: '10 Nov 2026', time: '06:00', totalSeats: 4, availableSeats: 0, price: 25.0, status: 'TERMINE', iaMatchScore: 85, bookingsCount: 4 },
    { id: 206, driver: 'Amine Jebali', driverPhone: '+216 52 334 998', origin: 'Nabeul', destination: 'Hammamet Sud', date: '09 Nov 2026', time: '18:00', totalSeats: 3, availableSeats: 3, price: 5.0, status: 'ANNULE', iaMatchScore: 78, bookingsCount: 0 }
  ];

  get filteredTrips(): AdminTrip[] {
    return this.trips.filter(t => {
      const matchSearch = !this.searchQuery ||
        t.origin.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.driver.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.id.toString().includes(this.searchQuery);

      const matchStatus = this.statusFilter === 'ALL' || t.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getCountByStatus(status: 'ACTIF' | 'EN_COURS' | 'TERMINE' | 'ANNULE'): number {
    return this.trips.filter(t => t.status === status).length;
  }

  getAvgScore(): number {
    const sum = this.trips.reduce((acc, t) => acc + t.iaMatchScore, 0);
    return Math.round(sum / this.trips.length);
  }

  viewTrip(t: AdminTrip) {
    this.selectedTrip = t;
  }

  cancelTrip(t: AdminTrip) {
    if (confirm(`Voulez-vous vraiment annuler le trajet #TRP-${t.id} ?`)) {
      t.status = 'ANNULE';
    }
  }

  deleteTrip(t: AdminTrip) {
    if (confirm(`Supprimer définitivement le trajet #TRP-${t.id} ?`)) {
      this.trips = this.trips.filter(x => x.id !== t.id);
      if (this.selectedTrip?.id === t.id) this.selectedTrip = null;
    }
  }
}
