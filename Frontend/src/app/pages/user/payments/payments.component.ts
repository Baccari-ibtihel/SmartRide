import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripStoreService, StoredPaymentRecord } from '../../../core/services/trip-store.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payments-page animate-fade">
      <div class="page-header">
        <div>
          <h1>💳 Mes Paiements & Factures</h1>
          <p class="sub">Historique de vos règlements de covoiturage et reçus officiels SmartRide</p>
        </div>
        <a routerLink="/user/bookings" class="btn btn-primary">📋 Voir mes réservations</a>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card card">
          <span class="stat-val text-accent">{{ totalSpent.toFixed(1) }} TND</span>
          <span class="stat-label">Total Dépensé</span>
        </div>
        <div class="stat-card card">
          <span class="stat-val text-success">{{ successCount }}</span>
          <span class="stat-label">Paiements Réussis</span>
        </div>
        <div class="stat-card card">
          <span class="stat-val text-primary">{{ payments.length }}</span>
          <span class="stat-label">Transactions Enregistrées</span>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="card table-card">
        <div class="table-container">
          <table class="payments-table">
            <thead>
              <tr>
                <th>Réf. Reçu</th>
                <th>Date</th>
                <th>Trajet</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments">
                <td><strong class="receipt-code">{{ p.receiptNumber }}</strong></td>
                <td>{{ p.date }}</td>
                <td>{{ p.tripRoute || 'Trajet Covoiturage' }}</td>
                <td><strong class="price-val">{{ p.amount.toFixed(1) }} TND</strong></td>
                <td>
                  <span class="method-tag">{{ p.method }}</span>
                </td>
                <td>
                  <span class="badge badge-success">✓ {{ p.status }}</span>
                </td>
                <td>
                  <button class="btn btn-outline btn-xs" (click)="viewReceipt(p)">
                    🧾 Reçu
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="payments.length === 0">
          <span class="empty-icon">💳</span>
          <h3>Aucun paiement effectué</h3>
          <p>Vos factures de covoiturage apparaîtront ici après avoir réglé vos trajets.</p>
          <a routerLink="/user/bookings" class="btn btn-primary">Aller aux réservations</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-page { max-width: 1000px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 1.6rem; color: var(--primary); margin: 0 0 4px; }
    .sub { color: var(--gray-500); font-size: 0.9rem; margin: 0; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card { text-align: center; padding: 20px; }
    .stat-val { display: block; font-size: 1.8rem; font-weight: 800; }
    .stat-label { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; margin-top: 4px; display: block; }

    .table-card { padding: 0; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .payments-table { width: 100%; border-collapse: collapse; text-align: left; }
    .payments-table th {
      background: var(--gray-50); padding: 14px 18px; font-size: 0.78rem;
      text-transform: uppercase; color: var(--gray-600); font-weight: 700;
      border-bottom: 1px solid var(--gray-200);
    }
    .payments-table td {
      padding: 14px 18px; font-size: 0.88rem; border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }
    .payments-table tr:hover { background: rgba(14,133,163,0.02); }

    .receipt-code { font-family: monospace; color: var(--secondary); font-size: 0.85rem; }
    .price-val { color: var(--accent); font-size: 0.95rem; }
    .method-tag {
      background: var(--gray-100); padding: 3px 8px; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600; color: var(--gray-700);
    }
    .btn-xs { font-size: 0.72rem; padding: 4px 10px; }

    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: StoredPaymentRecord[] = [];
  totalSpent = 0;
  successCount = 0;

  constructor(private tripStore: TripStoreService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.payments = this.tripStore.getPaymentsHistory();
    this.totalSpent = this.payments.reduce((sum, p) => sum + p.amount, 0);
    this.successCount = this.payments.filter(p => p.status === 'Payé').length;
  }

  viewReceipt(p: StoredPaymentRecord): void {
    alert(
      `🧾 REÇU DE PAIEMENT OFFICIEL SMARTRIDE\n` +
      `----------------------------------------\n` +
      `Numéro de reçu : ${p.receiptNumber}\n` +
      `Date : ${p.date}\n` +
      `Itinéraire : ${p.tripRoute}\n` +
      `Montant réglé : ${p.amount.toFixed(1)} TND\n` +
      `Moyen de paiement : ${p.method}\n` +
      `Statut : Validé (Paiement instantané sécurisé)\n` +
      `----------------------------------------\n` +
      `Merci d'avoir choisi SmartRide Tunisie !`
    );
  }
}
