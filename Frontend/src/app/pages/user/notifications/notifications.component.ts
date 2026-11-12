import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-page">
      <div class="page-header">
        <div>
          <h1>🔔 Centre de Notifications</h1>
          <p class="subtitle">Restez informé en temps réel de vos réservations, trajets et alertes de covoiturage</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-sm" (click)="addSimulatedNotification()">➕ Simuler Notification</button>
          <button class="btn btn-outline btn-sm" (click)="markAllRead()">Tout marquer lu</button>
          <button class="btn btn-outline btn-sm btn-danger-subtle" (click)="clearAll()">🗑️ Tout effacer</button>
        </div>
      </div>
      <div class="filter-bar">
        <button *ngFor="let f of filters" [class.active]="filter===f.key" (click)="filter=f.key">{{ f.label }}</button>
      </div>
      <div class="notif-list">
        <div class="notif-item" *ngFor="let n of getFiltered(); let i = index" [class.unread]="!n.isRead" (click)="n.isRead=true">
          <div class="notif-icon">{{ n.icon }}</div>
          <div class="notif-content">
            <strong>{{ n.title }}</strong>
            <p>{{ n.message }}</p>
            <span class="notif-time">{{ n.time }}</span>
          </div>
          <div class="notif-actions" (click)="$event.stopPropagation()">
            <div class="notif-dot" *ngIf="!n.isRead" title="Non lu"></div>
            <button class="btn-delete" (click)="deleteNotification(n)" title="Supprimer">✕</button>
          </div>
        </div>

        <div class="empty-notif" *ngIf="getFiltered().length === 0">
          <span>📭</span>
          <p>Aucune notification trouvée.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-page { max-width: 760px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.6rem; color: var(--primary); margin: 0; }
    .subtitle { font-size: 0.8rem; color: var(--gray-500); margin: 2px 0 0; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .btn-danger-subtle { color: var(--danger) !important; border-color: rgba(220,53,69,0.3) !important; }
    .btn-danger-subtle:hover { background: rgba(220,53,69,0.1) !important; }

    .filter-bar { display: flex; gap: 4px; margin-bottom: 20px; background: var(--white); padding: 4px; border-radius: var(--radius); box-shadow: var(--shadow-sm); flex-wrap: wrap; }
    .filter-bar button { flex: 1; padding: 8px; border: none; background: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font); font-size: 0.82rem; font-weight: 500; color: var(--gray-500); transition: var(--transition); white-space: nowrap; }
    .filter-bar button.active { background: var(--accent); color: white; }

    .notif-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; gap: 14px; padding: 16px; background: var(--white); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); position: relative; align-items: center; box-shadow: var(--shadow-sm); }
    .notif-item:hover { background: var(--gray-50); transform: translateY(-1px); }
    .notif-item.unread { background: rgba(14,133,163,0.04); border-left: 4px solid var(--accent); }
    .notif-icon { font-size: 1.6rem; flex-shrink: 0; }
    .notif-content { flex: 1; }
    .notif-content strong { display: block; font-size: 0.92rem; margin-bottom: 4px; color: var(--gray-800); }
    .notif-content p { font-size: 0.85rem; color: var(--gray-600); margin-bottom: 4px; }
    .notif-time { font-size: 0.75rem; color: var(--gray-400); }

    .notif-actions { display: flex; align-items: center; gap: 10px; }
    .notif-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
    .btn-delete { background: none; border: none; color: var(--gray-400); font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: var(--transition); }
    .btn-delete:hover { color: var(--danger); background: rgba(220,53,69,0.1); }

    .empty-notif { text-align: center; padding: 40px; color: var(--gray-400); }
    .empty-notif span { font-size: 2.5rem; display: block; margin-bottom: 8px; }
  `]
})
export class NotificationsComponent {
  filter = 'all';
  filters = [
    { key: 'all', label: 'Toutes' }, { key: 'BOOKING', label: 'Réservations' },
    { key: 'TRIP', label: 'Trajets' }, { key: 'SYSTEM', label: 'Système' }
  ];
  notifications = [
    { icon: '✅', title: 'Réservation confirmée', message: 'Votre réservation pour Ariana → Lac 2 a été confirmée par le conducteur.', time: 'il y a 10 min', type: 'BOOKING', isRead: false },
    { icon: '🚗', title: 'Nouveau match IA trouvé', message: 'Un nouveau trajet correspond à vos critères : Ennasr → Centre Ville (Score de compatibilité: 94%)', time: 'il y a 1 heure', type: 'TRIP', isRead: false },
    { icon: '💳', title: 'Paiement reçu', message: 'Le paiement de 8.5 TND a été traité avec succès par Flouci.', time: 'il y a 3 heures', type: 'BOOKING', isRead: false },
    { icon: '⭐', title: 'Nouvel avis reçu', message: 'Sami M. vous a donné une note de 5 étoiles. Bravo pour votre ponctualité !', time: 'hier', type: 'SYSTEM', isRead: true },
    { icon: '🔔', title: 'Rappel de trajet', message: 'Votre trajet Ariana → Lac 2 est prévu demain à 08:15.', time: 'hier', type: 'TRIP', isRead: true },
    { icon: '🛡️', title: 'Mise à jour de sécurité', message: 'Vérification Keycloak SSO activée avec succès.', time: 'il y a 3 jours', type: 'SYSTEM', isRead: true },
  ];

  getFiltered() { return this.filter === 'all' ? this.notifications : this.notifications.filter(n => n.type === this.filter); }
  markAllRead() { this.notifications.forEach(n => n.isRead = true); }

  deleteNotification(item: any) {
    this.notifications = this.notifications.filter(n => n !== item);
  }

  clearAll() {
    if (confirm('Effacer toutes les notifications ?')) {
      this.notifications = [];
    }
  }

  addSimulatedNotification() {
    const samples = [
      { icon: '📍', title: 'Conducteur en approche !', message: 'Sami est à 500m de votre point de rendez-vous. Préparez-vous !', type: 'TRIP' },
      { icon: '⚡', title: 'Alerte Trafic', message: 'Ralentissement détecté sur la Route GP9 (+7 min). Nouvel itinéraire calculé.', type: 'SYSTEM' },
      { icon: '💳', title: 'Remboursement effectué', message: 'Le remboursement de 10.0 TND suite à annulation a été crédité.', type: 'BOOKING' },
      { icon: '🎉', title: 'Félicitations !', message: 'Vous avez complété 10 trajets de covoiturage sur SmartRide !', type: 'SYSTEM' }
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    this.notifications.unshift({
      ...pick,
      time: "À l'instant",
      isRead: false
    });
  }
}
