import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-page">
      <div class="page-header">
        <h1>🔔 Notifications</h1>
        <button class="btn btn-outline btn-sm" (click)="markAllRead()">Tout marquer comme lu</button>
      </div>
      <div class="filter-bar">
        <button *ngFor="let f of filters" [class.active]="filter===f.key" (click)="filter=f.key">{{ f.label }}</button>
      </div>
      <div class="notif-list">
        <div class="notif-item" *ngFor="let n of getFiltered()" [class.unread]="!n.isRead" (click)="n.isRead=true">
          <div class="notif-icon">{{ n.icon }}</div>
          <div class="notif-content">
            <strong>{{ n.title }}</strong>
            <p>{{ n.message }}</p>
            <span class="notif-time">{{ n.time }}</span>
          </div>
          <div class="notif-dot" *ngIf="!n.isRead"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-page { max-width: 700px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 1.6rem; color: var(--primary); }
    .filter-bar { display: flex; gap: 4px; margin-bottom: 20px; background: var(--white); padding: 4px; border-radius: var(--radius); box-shadow: var(--shadow-sm); }
    .filter-bar button { flex: 1; padding: 8px; border: none; background: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font); font-size: 0.82rem; font-weight: 500; color: var(--gray-500); transition: var(--transition); }
    .filter-bar button.active { background: var(--accent); color: white; }
    .notif-list { display: flex; flex-direction: column; gap: 2px; }
    .notif-item { display: flex; gap: 14px; padding: 16px; background: var(--white); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); position: relative; align-items: flex-start; }
    .notif-item:hover { background: var(--gray-50); }
    .notif-item.unread { background: rgba(14,133,163,0.04); border-left: 3px solid var(--accent); }
    .notif-icon { font-size: 1.5rem; flex-shrink: 0; }
    .notif-content { flex: 1; }
    .notif-content strong { display: block; font-size: 0.9rem; margin-bottom: 4px; }
    .notif-content p { font-size: 0.85rem; color: var(--gray-600); margin-bottom: 4px; }
    .notif-time { font-size: 0.75rem; color: var(--gray-400); }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 6px; }
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
    { icon: '🚗', title: 'Nouveau match trouvé', message: 'Un nouveau trajet correspond à vos critères : Ennasr → Centre Ville (Score: 94%)', time: 'il y a 1 heure', type: 'TRIP', isRead: false },
    { icon: '💳', title: 'Paiement reçu', message: 'Le paiement de 8.5 TND a été traité avec succès.', time: 'il y a 3 heures', type: 'BOOKING', isRead: false },
    { icon: '⭐', title: 'Nouvel avis', message: 'Sami M. vous a donné une note de 5 étoiles. Consultez votre profil.', time: 'hier', type: 'SYSTEM', isRead: true },
    { icon: '🔔', title: 'Rappel de trajet', message: 'Votre trajet Ariana → Lac 2 est prévu demain à 08:15.', time: 'hier', type: 'TRIP', isRead: true },
    { icon: '🛡️', title: 'Mise à jour de sécurité', message: 'Nous avons renforcé les mesures de vérification des profils.', time: 'il y a 3 jours', type: 'SYSTEM', isRead: true },
  ];
  getFiltered() { return this.filter === 'all' ? this.notifications : this.notifications.filter(n => n.type === this.filter); }
  markAllRead() { this.notifications.forEach(n => n.isRead = true); }
}
