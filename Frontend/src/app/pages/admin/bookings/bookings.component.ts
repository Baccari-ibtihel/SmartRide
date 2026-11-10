import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminBooking {
  id: number;
  passengerName: string;
  passengerPhone: string;
  driverName: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  totalPrice: number;
  status: 'CONFIRMEE' | 'EN_ATTENTE' | 'ANNULEE' | 'TERMINEE';
  paymentStatus: 'PAYE' | 'EN_ATTENTE' | 'REMBOURSE';
  bookedAt: string;
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-bookings-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Gestion des Réservations</h2>
          <p class="text-muted">Consultez, validez ou annulez les réservations effectuées sur les trajets</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-val">{{ bookings.length }}</span>
          <span class="m-lbl">Total Réservations</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-success">{{ getCountByStatus('CONFIRMEE') }}</span>
          <span class="m-lbl">Confirmées</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-warning">{{ getCountByStatus('EN_ATTENTE') }}</span>
          <span class="m-lbl">En Attente</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-accent">{{ getTotalRevenue() }} TND</span>
          <span class="m-lbl">Volume d'affaires</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par passager, conducteur ou ville..." 
            [(ngModel)]="searchQuery"
            class="form-control"
          />
        </div>
        <div class="select-filters">
          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="ALL">Tous les statuts</option>
            <option value="CONFIRMEE">Confirmées</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="TERMINEE">Terminées</option>
            <option value="ANNULEE">Annulées</option>
          </select>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="table-container card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Passager</th>
              <th>Trajet & Conducteur</th>
              <th>Date / Heure</th>
              <th>Places</th>
              <th>Montant</th>
              <th>Statut Réservation</th>
              <th>Paiement</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of filteredBookings">
              <td><strong>#BK-{{ b.id }}</strong></td>
              <td>
                <div class="user-info">
                  <strong>{{ b.passengerName }}</strong>
                  <span class="text-muted">{{ b.passengerPhone }}</span>
                </div>
              </td>
              <td>
                <div class="trip-info">
                  <strong>{{ b.origin }} ➔ {{ b.destination }}</strong>
                  <span class="text-muted">Conducteur : {{ b.driverName }}</span>
                </div>
              </td>
              <td>
                <span>{{ b.departureTime }}</span>
              </td>
              <td>
                <strong class="seats-count">{{ b.seats }} pl.</strong>
              </td>
              <td>
                <strong class="text-accent">{{ b.totalPrice.toFixed(1) }} TND</strong>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': b.status === 'CONFIRMEE',
                  'badge-warning': b.status === 'EN_ATTENTE',
                  'badge-info': b.status === 'TERMINEE',
                  'badge-danger': b.status === 'ANNULEE'
                }">{{ b.status }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': b.paymentStatus === 'PAYE',
                  'badge-warning': b.paymentStatus === 'EN_ATTENTE',
                  'badge-danger': b.paymentStatus === 'REMBOURSE'
                }">{{ b.paymentStatus }}</span>
              </td>
              <td>
                <div class="actions-cell">
                  <button 
                    *ngIf="b.status === 'EN_ATTENTE'" 
                    class="btn btn-sm btn-success" 
                    (click)="updateStatus(b, 'CONFIRMEE')" 
                    title="Confirmer"
                  >✓</button>
                  <button 
                    *ngIf="b.status === 'CONFIRMEE' || b.status === 'EN_ATTENTE'" 
                    class="btn btn-sm btn-warning" 
                    (click)="updateStatus(b, 'ANNULEE')" 
                    title="Annuler"
                  >✕</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteBooking(b)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredBookings.length === 0">
          <p class="text-muted">Aucune réservation trouvée.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-bookings-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { text-align: center; padding: 16px; }
    .m-val { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .m-lbl { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; }

    .filter-bar { display: flex; gap: 16px; align-items: center; padding: 16px; }
    .search-box { flex: 1; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .search-box input { padding-left: 38px; }

    .user-info, .trip-info { display: flex; flex-direction: column; font-size: 0.85rem; }
    .seats-count { background: var(--gray-100); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .actions-cell { display: flex; justify-content: center; gap: 6px; }
  `]
})
export class AdminBookingsComponent {
  searchQuery = '';
  statusFilter = 'ALL';

  bookings: AdminBooking[] = [
    { id: 401, passengerName: 'Ibtihel Baccari', passengerPhone: '+216 55 123 456', driverName: 'Sami Mansouri', origin: 'Ariana', destination: 'Lac 2', departureTime: '11 Nov - 08:15', seats: 1, totalPrice: 8.5, status: 'CONFIRMEE', paymentStatus: 'PAYE', bookedAt: '10 Nov 2026' },
    { id: 402, passengerName: 'Mohamed Dridi', passengerPhone: '+216 99 221 443', driverName: 'Amira Ben Salah', origin: 'Ennasr 2', destination: 'Tunis Centre', departureTime: '11 Nov - 08:30', seats: 2, totalPrice: 12.0, status: 'EN_ATTENTE', paymentStatus: 'EN_ATTENTE', bookedAt: '10 Nov 2026' },
    { id: 403, passengerName: 'Leila Bouazizi', passengerPhone: '+216 52 900 111', driverName: 'Youssef Trabelsi', origin: 'La Marsa', destination: 'El Ghazala', departureTime: '11 Nov - 07:45', seats: 1, totalPrice: 7.0, status: 'CONFIRMEE', paymentStatus: 'PAYE', bookedAt: '09 Nov 2026' },
    { id: 404, passengerName: 'Fatma Khelifi', passengerPhone: '+216 27 654 321', driverName: 'Karim Gharbi', origin: 'Sfax', destination: 'Tunis', departureTime: '10 Nov - 06:00', seats: 1, totalPrice: 25.0, status: 'TERMINEE', paymentStatus: 'PAYE', bookedAt: '08 Nov 2026' },
    { id: 405, passengerName: 'Amine Jebali', passengerPhone: '+216 52 334 998', driverName: 'Fatma Khelifi', origin: 'Sousse', destination: 'Monastir', departureTime: '12 Nov - 09:00', seats: 1, totalPrice: 10.0, status: 'ANNULEE', paymentStatus: 'REMBOURSE', bookedAt: '07 Nov 2026' }
  ];

  get filteredBookings(): AdminBooking[] {
    return this.bookings.filter(b => {
      const matchSearch = !this.searchQuery ||
        b.passengerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        b.driverName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        b.origin.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        b.id.toString().includes(this.searchQuery);

      const matchStatus = this.statusFilter === 'ALL' || b.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getCountByStatus(status: 'CONFIRMEE' | 'EN_ATTENTE' | 'TERMINEE' | 'ANNULEE'): number {
    return this.bookings.filter(b => b.status === status).length;
  }

  getTotalRevenue(): number {
    return this.bookings
      .filter(b => b.status === 'CONFIRMEE' || b.status === 'TERMINEE')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }

  updateStatus(b: AdminBooking, newStatus: 'CONFIRMEE' | 'ANNULEE') {
    b.status = newStatus;
    if (newStatus === 'ANNULEE') {
      b.paymentStatus = 'REMBOURSE';
    } else if (newStatus === 'CONFIRMEE') {
      b.paymentStatus = 'PAYE';
    }
  }

  deleteBooking(b: AdminBooking) {
    if (confirm(`Supprimer la réservation #BK-${b.id} ?`)) {
      this.bookings = this.bookings.filter(x => x.id !== b.id);
    }
  }
}
