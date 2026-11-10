import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminPayment {
  id: string;
  bookingId: number;
  userName: string;
  amount: number;
  commission: number;
  driverShare: number;
  method: 'FLOUCI' | 'D17' | 'CARTE' | 'ESPECES';
  status: 'PAYE' | 'EN_ATTENTE' | 'REMBOURSE' | 'ECHOUE';
  date: string;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-payments-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Gestion des Paiements & Finances</h2>
          <p class="text-muted">Suivi des flux financiers, commissions SmartRide et passerelles (Flouci, D17, Carte)</p>
        </div>
        <button class="btn btn-outline" (click)="exportReport()">
          📥 Exporter le Rapport
        </button>
      </div>

      <!-- Financial Metrics -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-val text-primary">{{ getTotalVolume().toFixed(2) }} TND</span>
          <span class="m-lbl">Volume Global</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-success">{{ getTotalCommission().toFixed(2) }} TND</span>
          <span class="m-lbl">Commissions (12%)</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-accent">{{ getTotalDriverPayouts().toFixed(2) }} TND</span>
          <span class="m-lbl">Rémunération Conducteurs</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-warning">{{ getPendingVolume().toFixed(2) }} TND</span>
          <span class="m-lbl">En Attente Virement</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par ID Transaction, utilisateur ou montant..." 
            [(ngModel)]="searchQuery"
            class="form-control"
          />
        </div>
        <div class="select-filters">
          <select class="form-control" [(ngModel)]="methodFilter">
            <option value="ALL">Toutes les méthodes</option>
            <option value="FLOUCI">Flouci</option>
            <option value="D17">D17 (Poste Tunisienne)</option>
            <option value="CARTE">Carte Bancaire (GIM-TEL)</option>
            <option value="ESPECES">Espèces</option>
          </select>

          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="ALL">Tous les statuts</option>
            <option value="PAYE">Payés</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="REMBOURSE">Remboursés</option>
            <option value="ECHOUE">Échoués</option>
          </select>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="table-container card">
        <table>
          <thead>
            <tr>
              <th>ID Transaction</th>
              <th>Réservation</th>
              <th>Payeur</th>
              <th>Montant Total</th>
              <th>Commission (12%)</th>
              <th>Net Conducteur</th>
              <th>Passerelle</th>
              <th>Date</th>
              <th>Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPayments">
              <td><strong>{{ p.id }}</strong></td>
              <td><span class="badge badge-info">#BK-{{ p.bookingId }}</span></td>
              <td><strong>{{ p.userName }}</strong></td>
              <td><strong class="text-accent">{{ p.amount.toFixed(2) }} TND</strong></td>
              <td><span class="text-success">+{{ p.commission.toFixed(2) }} TND</span></td>
              <td><strong>{{ p.driverShare.toFixed(2) }} TND</strong></td>
              <td>
                <span class="gateway-badge" [ngClass]="p.method.toLowerCase()">
                  {{ p.method }}
                </span>
              </td>
              <td>{{ p.date }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': p.status === 'PAYE',
                  'badge-warning': p.status === 'EN_ATTENTE',
                  'badge-danger': p.status === 'ECHOUE',
                  'badge-info': p.status === 'REMBOURSE'
                }">{{ p.status }}</span>
              </td>
              <td>
                <div class="actions-cell">
                  <button 
                    *ngIf="p.status === 'PAYE'" 
                    class="btn btn-sm btn-outline" 
                    (click)="refund(p)" 
                    title="Effectuer un remboursement"
                  >🔄</button>
                  <button class="btn btn-sm btn-outline" (click)="viewReceipt(p)" title="Reçu">🧾</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredPayments.length === 0">
          <p class="text-muted">Aucune transaction trouvée.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-payments-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar { display: flex; justify-content: space-between; align-items: center; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { text-align: center; padding: 16px; }
    .m-val { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .m-lbl { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; }

    .filter-bar { display: flex; gap: 16px; align-items: center; padding: 16px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .search-box input { padding-left: 38px; }
    .select-filters { display: flex; gap: 12px; }

    .gateway-badge {
      display: inline-block; padding: 4px 10px; border-radius: var(--radius-sm);
      font-size: 0.78rem; font-weight: 700;
    }
    .gateway-badge.flouci { background: #e0f2fe; color: #0284c7; }
    .gateway-badge.d17 { background: #fef3c7; color: #d97706; }
    .gateway-badge.carte { background: #f3e8ff; color: #7e22ce; }
    .gateway-badge.especes { background: #f1f5f9; color: #475569; }

    .actions-cell { display: flex; justify-content: center; gap: 6px; }
  `]
})
export class AdminPaymentsComponent {
  searchQuery = '';
  methodFilter = 'ALL';
  statusFilter = 'ALL';

  payments: AdminPayment[] = [
    { id: 'TXN-9021', bookingId: 401, userName: 'Ibtihel Baccari', amount: 8.5, commission: 1.02, driverShare: 7.48, method: 'FLOUCI', status: 'PAYE', date: '10 Nov 2026 14:22' },
    { id: 'TXN-9022', bookingId: 402, userName: 'Mohamed Dridi', amount: 12.0, commission: 1.44, driverShare: 10.56, method: 'D17', status: 'EN_ATTENTE', date: '10 Nov 2026 15:40' },
    { id: 'TXN-9023', bookingId: 403, userName: 'Leila Bouazizi', amount: 7.0, commission: 0.84, driverShare: 6.16, method: 'CARTE', status: 'PAYE', date: '09 Nov 2026 09:15' },
    { id: 'TXN-9024', bookingId: 404, userName: 'Fatma Khelifi', amount: 25.0, commission: 3.00, driverShare: 22.00, method: 'FLOUCI', status: 'PAYE', date: '08 Nov 2026 18:30' },
    { id: 'TXN-9025', bookingId: 405, userName: 'Amine Jebali', amount: 10.0, commission: 1.20, driverShare: 8.80, method: 'D17', status: 'REMBOURSE', date: '07 Nov 2026 11:10' },
    { id: 'TXN-9026', bookingId: 406, userName: 'Yassine Mami', amount: 15.0, commission: 1.80, driverShare: 13.20, method: 'CARTE', status: 'ECHOUE', date: '06 Nov 2026 16:45' }
  ];

  get filteredPayments(): AdminPayment[] {
    return this.payments.filter(p => {
      const matchSearch = !this.searchQuery ||
        p.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.amount.toString().includes(this.searchQuery);

      const matchMethod = this.methodFilter === 'ALL' || p.method === this.methodFilter;
      const matchStatus = this.statusFilter === 'ALL' || p.status === this.statusFilter;

      return matchSearch && matchMethod && matchStatus;
    });
  }

  getTotalVolume(): number {
    return this.payments
      .filter(p => p.status === 'PAYE')
      .reduce((s, p) => s + p.amount, 0);
  }

  getTotalCommission(): number {
    return this.payments
      .filter(p => p.status === 'PAYE')
      .reduce((s, p) => s + p.commission, 0);
  }

  getTotalDriverPayouts(): number {
    return this.payments
      .filter(p => p.status === 'PAYE')
      .reduce((s, p) => s + p.driverShare, 0);
  }

  getPendingVolume(): number {
    return this.payments
      .filter(p => p.status === 'EN_ATTENTE')
      .reduce((s, p) => s + p.amount, 0);
  }

  refund(p: AdminPayment) {
    if (confirm(`Confirmez-vous le remboursement de ${p.amount} TND pour ${p.userName} ?`)) {
      p.status = 'REMBOURSE';
    }
  }

  viewReceipt(p: AdminPayment) {
    alert(`Reçu fiscal #${p.id}\nClient : ${p.userName}\nMontant : ${p.amount} TND via ${p.method}\nDate : ${p.date}\nStatut : ${p.status}`);
  }

  exportReport() {
    alert('Téléchargement du grand livre des transactions au format CSV/Excel.');
  }
}
