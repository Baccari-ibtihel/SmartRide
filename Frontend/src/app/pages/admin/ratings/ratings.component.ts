import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminRating {
  id: number;
  author: string;
  targetUser: string;
  role: 'CONDUCTEUR' | 'PASSAGER';
  tripRoute: string;
  stars: number;
  comment: string;
  date: string;
  isFlagged: boolean;
  status: 'PUBLIE' | 'MASQUE' | 'EN_MODERATION';
}

@Component({
  selector: 'app-admin-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-ratings-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Modération des Avis & Notes</h2>
          <p class="text-muted">Consultez les feedbacks utilisateurs, gérez les signalements et maintenez la qualité du service</p>
        </div>
      </div>

      <!-- Ratings Analytics -->
      <div class="ratings-overview card">
        <div class="score-summary">
          <span class="big-score">{{ getAverageRating() }}</span>
          <div class="stars-visual">⭐⭐⭐⭐⭐</div>
          <span class="text-muted">Basé sur {{ ratings.length }} évaluations</span>
        </div>

        <div class="distribution-bars">
          <div class="dist-row" *ngFor="let s of [5, 4, 3, 2, 1]">
            <span class="star-lbl">{{ s }} ★</span>
            <div class="progress-track">
              <div class="progress-fill" [style.width]="getStarPercentage(s) + '%'"></div>
            </div>
            <span class="count-lbl">{{ getStarCount(s) }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par auteur, destinataire ou commentaire..." 
            [(ngModel)]="searchQuery"
            class="form-control"
          />
        </div>
        <div class="select-filters">
          <select class="form-control" [(ngModel)]="starFilter">
            <option value="ALL">Toutes les notes</option>
            <option value="5">5 Étoiles</option>
            <option value="4">4 Étoiles</option>
            <option value="3">3 Étoiles</option>
            <option value="2">2 Étoiles</option>
            <option value="1">1 Étoile</option>
          </select>

          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="ALL">Tous les statuts</option>
            <option value="PUBLIE">Publiés</option>
            <option value="EN_MODERATION">Signalés / En modération</option>
            <option value="MASQUE">Masqués</option>
          </select>
        </div>
      </div>

      <!-- Reviews Feed -->
      <div class="reviews-grid">
        <div class="review-card card" *ngFor="let r of filteredRatings" [class.flagged]="r.isFlagged">
          <div class="card-top">
            <div class="author-meta">
              <div class="avatar">{{ r.author.substring(0, 2).toUpperCase() }}</div>
              <div>
                <strong>{{ r.author }}</strong>
                <span class="text-muted">a noté {{ r.targetUser }} ({{ r.role }})</span>
              </div>
            </div>
            <div class="review-status">
              <span class="badge" [ngClass]="{
                'badge-success': r.status === 'PUBLIE',
                'badge-danger': r.status === 'MASQUE',
                'badge-warning': r.status === 'EN_MODERATION'
              }">{{ r.status }}</span>
              <span class="flag-icon" *ngIf="r.isFlagged" title="Avis signalé par la communauté">🚩</span>
            </div>
          </div>

          <div class="rating-stars mt-1">
            <span class="stars-text">{{ getStarsDisplay(r.stars) }}</span>
            <span class="route-tag">🚗 {{ r.tripRoute }}</span>
            <span class="date-tag text-muted">📅 {{ r.date }}</span>
          </div>

          <p class="review-body mt-2">"{{ r.comment }}"</p>

          <div class="card-actions mt-2">
            <button 
              class="btn btn-sm btn-outline" 
              (click)="toggleFlag(r)"
            >
              {{ r.isFlagged ? 'Retirer signalement' : 'Signaler' }}
            </button>
            <button 
              class="btn btn-sm"
              [ngClass]="r.status === 'PUBLIE' ? 'btn-danger' : 'btn-success'"
              (click)="togglePublish(r)"
            >
              {{ r.status === 'PUBLIE' ? 'Masquer' : 'Approuver' }}
            </button>
            <button 
              class="btn btn-sm btn-outline text-danger" 
              (click)="deleteRating(r)"
              title="Supprimer définitivement l'avis"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <div class="empty-state card" *ngIf="filteredRatings.length === 0">
          <p class="text-muted">Aucune évaluation ne correspond à ce filtre.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-ratings-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }

    .ratings-overview {
      display: flex; gap: 40px; align-items: center; padding: 24px;
    }
    .score-summary { text-align: center; min-width: 180px; }
    .big-score { font-size: 3rem; font-weight: 800; color: var(--primary); display: block; line-height: 1; }
    .stars-visual { font-size: 1.2rem; margin: 8px 0; }

    .distribution-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .dist-row { display: flex; align-items: center; gap: 12px; }
    .star-lbl { width: 30px; font-size: 0.85rem; font-weight: 600; }
    .progress-track { flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #f59e0b; border-radius: 4px; }
    .count-lbl { width: 30px; font-size: 0.8rem; color: var(--gray-500); text-align: right; }

    .filter-bar { display: flex; gap: 16px; align-items: center; padding: 16px; }
    .search-box { flex: 1; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .search-box input { padding-left: 38px; }

    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .review-card { padding: 20px; transition: var(--transition); border-left: 4px solid transparent; }
    .review-card.flagged { border-left-color: var(--danger); background: #fffdfd; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .author-meta { display: flex; align-items: center; gap: 10px; }
    .author-meta strong { display: block; font-size: 0.95rem; }
    .review-status { display: flex; align-items: center; gap: 6px; }
    .flag-icon { font-size: 1rem; }

    .rating-stars { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .stars-text { font-size: 0.9rem; letter-spacing: 2px; }
    .route-tag, .date-tag { font-size: 0.75rem; background: var(--gray-100); padding: 2px 8px; border-radius: 12px; }
    .review-body { font-size: 0.9rem; color: var(--gray-700); line-height: 1.5; font-style: italic; }
    .card-actions { display: flex; justify-content: flex-end; gap: 8px; }

    @media (max-width: 768px) {
      .ratings-overview { flex-direction: column; align-items: stretch; }
      .reviews-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminRatingsComponent {
  searchQuery = '';
  starFilter = 'ALL';
  statusFilter = 'ALL';

  ratings: AdminRating[] = [
    { id: 1, author: 'Leila Bouazizi', targetUser: 'Sami Mansouri', role: 'CONDUCTEUR', tripRoute: 'Ariana ➔ Lac 2', stars: 5, comment: 'Excellent conducteur, ponctuel et voiture très propre. Je recommande les yeux fermés !', date: '08 Nov 2026', isFlagged: false, status: 'PUBLIE' },
    { id: 2, author: 'Mohamed Hammami', targetUser: 'Sami Mansouri', role: 'CONDUCTEUR', tripRoute: 'Ariana ➔ Lac 2', stars: 4, comment: 'Bon trajet dans l ensemble, musique agréable. 5 min de retard au départ.', date: '07 Nov 2026', isFlagged: false, status: 'PUBLIE' },
    { id: 3, author: 'Fatma Khelifi', targetUser: 'Karim Gharbi', role: 'CONDUCTEUR', tripRoute: 'Sfax ➔ Tunis', stars: 2, comment: 'Conduite un peu trop rapide sur l autoroute et climatisation en panne par forte chaleur.', date: '06 Nov 2026', isFlagged: true, status: 'EN_MODERATION' },
    { id: 4, author: 'Youssef Trabelsi', targetUser: 'Ibtihel Baccari', role: 'PASSAGER', tripRoute: 'La Marsa ➔ Ghazala', stars: 5, comment: 'Passagère très respectueuse et ponctuelle. Discussion très enrichissante.', date: '05 Nov 2026', isFlagged: false, status: 'PUBLIE' },
    { id: 5, author: 'Amine Jebali', targetUser: 'Karim Gharbi', role: 'CONDUCTEUR', tripRoute: 'Nabeul ➔ Hammamet', stars: 1, comment: 'Annulation au dernier moment sans explications. Très déçu de l expérience.', date: '04 Nov 2026', isFlagged: true, status: 'MASQUE' }
  ];

  get filteredRatings(): AdminRating[] {
    return this.ratings.filter(r => {
      const matchSearch = !this.searchQuery ||
        r.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.targetUser.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchStar = this.starFilter === 'ALL' || r.stars.toString() === this.starFilter;
      const matchStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;

      return matchSearch && matchStar && matchStatus;
    });
  }

  getAverageRating(): string {
    const sum = this.ratings.reduce((acc, r) => acc + r.stars, 0);
    return (sum / this.ratings.length).toFixed(1);
  }

  getStarCount(star: number): number {
    return this.ratings.filter(r => r.stars === star).length;
  }

  getStarPercentage(star: number): number {
    return (this.getStarCount(star) / this.ratings.length) * 100;
  }

  getStarsDisplay(count: number): string {
    return '⭐'.repeat(count);
  }

  toggleFlag(r: AdminRating) {
    r.isFlagged = !r.isFlagged;
    if (r.isFlagged && r.status === 'PUBLIE') {
      r.status = 'EN_MODERATION';
    }
  }

  togglePublish(r: AdminRating) {
    r.status = r.status === 'PUBLIE' ? 'MASQUE' : 'PUBLIE';
  }

  deleteRating(r: AdminRating) {
    if (confirm(`Supprimer définitivement l'avis de ${r.author} ?`)) {
      this.ratings = this.ratings.filter(item => item.id !== r.id);
    }
  }
}
